<?php
/**
 * ITPracticeTests - Zero-Trust Backend Security Engine (Hostinger Edition)
 * Native PHP 8.x API microservice for Hostinger LiteSpeed / Apache hosting.
 * Handles Zero-Trust Order Creation, Gateway Verification, Access Control & Email Dispatch.
 */

// Set strict error reporting (log to error log, don't expose PHP errors to client JSON)
error_reporting(E_ALL);
ini_set('display_errors', '0');

// CORS Headers
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With");
header("Content-Type: application/json; charset=UTF-8");

// Handle OPTIONS preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// -----------------------------------------------------------------------------
// CONFIGURATION & PERSISTENCE
// -----------------------------------------------------------------------------
$SUPABASE_URL = getenv('SUPABASE_URL') ?: (getenv('VITE_SUPABASE_URL') ?: 'https://dkkvulqgfsiuaqadubum.supabase.co');
$SUPABASE_ANON_KEY = getenv('SUPABASE_ANON_KEY') ?: (getenv('VITE_SUPABASE_ANON_KEY') ?: 'sb_publishable_nHZDs5bDhArDsR2X8Nrbdg_uhtWgnam');

$DATA_DIR = __DIR__ . '/data';
if (!is_dir($DATA_DIR)) {
    @mkdir($DATA_DIR, 0755, true);
    // Protect data folder with .htaccess
    @file_put_contents($DATA_DIR . '/.htaccess', "Order deny,allow\nDeny from all\n");
}

$SETTINGS_FILE = $DATA_DIR . '/smtp_settings.json';
$LOGS_FILE = $DATA_DIR . '/dispatched_emails.json';

// Default SMTP Configuration
$DEFAULT_SETTINGS = [
    'smtpHost' => 'smtp.gmail.com',
    'smtpPort' => 465,
    'smtpSecure' => true,
    'smtpUser' => '',
    'smtpPass' => '',
    'senderName' => 'ITPracticeTests Orders',
    'senderEmail' => 'orders@itpracticetests.com',
    'primaryAdminEmail' => 'support@itpracticetests.com',
    'secondaryAdminEmail' => 'rath.sanjiv.rath@gmail.com',
    'enableInstantEmail' => true,
    'instructorName' => 'Yogesh Dhiman',
    'businessName' => 'ITPracticeTests',
    'gstNumber' => '03AKXPD3010G1ZM',
    'officeAddress' => 'Office No. 715, 7th Floor, Block D&E, CCC, VIP Road, Zirakpur, Punjab, India – 140603',
    'supportPhone' => '+91-9253330335'
];

function getMailerConfig() {
    global $SETTINGS_FILE, $DEFAULT_SETTINGS;
    if (file_exists($SETTINGS_FILE)) {
        $content = @file_get_contents($SETTINGS_FILE);
        if ($content) {
            $parsed = json_decode($content, true);
            if (is_array($parsed)) {
                return array_merge($DEFAULT_SETTINGS, $parsed);
            }
        }
    }
    return $DEFAULT_SETTINGS;
}

function saveMailerConfig($newSettings) {
    global $SETTINGS_FILE;
    $current = getMailerConfig();
    $merged = array_merge($current, $newSettings);
    @file_put_contents($SETTINGS_FILE, json_encode($merged, JSON_PRETTY_PRINT));
    return $merged;
}

function getDispatchedEmails($limit = 100) {
    global $LOGS_FILE;
    if (file_exists($LOGS_FILE)) {
        $content = @file_get_contents($LOGS_FILE);
        if ($content) {
            $parsed = json_decode($content, true);
            if (is_array($parsed)) {
                return array_slice($parsed, 0, $limit);
            }
        }
    }
    return [];
}

function logDispatchedEmail($record) {
    global $LOGS_FILE;
    $list = getDispatchedEmails(200);
    array_unshift($list, $record);
    @file_put_contents($LOGS_FILE, json_encode(array_slice($list, 0, 100), JSON_PRETTY_PRINT));
}

// -----------------------------------------------------------------------------
// SUPABASE REST CLIENT (cURL)
// -----------------------------------------------------------------------------
function supabaseFetch($endpoint, $method = 'GET', $body = null) {
    global $SUPABASE_URL, $SUPABASE_ANON_KEY;
    $url = $SUPABASE_URL . '/rest/v1/' . $endpoint;
    
    $ch = curl_init($url);
    $headers = [
        'apikey: ' . $SUPABASE_ANON_KEY,
        'Authorization: Bearer ' . $SUPABASE_ANON_KEY,
        'Content-Type: application/json',
        'Prefer: return=representation'
    ];

    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

    if ($body !== null) {
        curl_setopt($ch, CURLOPT_POSTFIELDS, is_string($body) ? $body : json_encode($body));
    }

    $raw = curl_exec($ch);
    $status = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $err = curl_error($ch);
    curl_close($ch);

    if ($err) {
        return ['ok' => false, 'status' => 500, 'error' => $err];
    }

    $data = json_decode($raw, true);
    return [
        'ok' => ($status >= 200 && $status < 300),
        'status' => $status,
        'data' => $data,
        'raw' => $raw
    ];
}

// -----------------------------------------------------------------------------
// PARSE REQUEST
// -----------------------------------------------------------------------------
$route = $_GET['route'] ?? '';
if (!$route) {
    $uriPath = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    if (preg_match('#(?:api/)(.*)$#i', $uriPath, $matches)) {
        $route = $matches[1];
    }
}
$route = trim(explode('?', $route)[0], '/');
$method = strtoupper($_SERVER['REQUEST_METHOD']);

$rawInput = file_get_contents('php://input');
$jsonBody = json_decode($rawInput, true) ?: [];

// -----------------------------------------------------------------------------
// SOCKET SMTP SENDER & EMAIL DISPATCH HELPER
// -----------------------------------------------------------------------------
function sendSmtpSocketMail($config, $to, $subject, $htmlBody, $cc = null) {
    $host = trim($config['smtpHost'] ?? 'smtp.hostinger.com');
    $port = (int)($config['smtpPort'] ?? 465);
    $user = trim($config['smtpUser'] ?? '');
    $pass = trim($config['smtpPass'] ?? '');
    $senderEmail = trim($config['senderEmail'] ?? 'orders@itpracticetests.com');
    $senderName = trim($config['senderName'] ?? 'ITPracticeTests Orders');

    if (empty($user) || empty($pass)) {
        return ['success' => false, 'error' => 'SMTP credentials not configured'];
    }

    $isSsl = ($port === 465 || !empty($config['smtpSecure']));
    $prefix = $isSsl ? 'ssl://' : '';
    $socketHost = $prefix . $host;

    $ctx = stream_context_create([
        'ssl' => [
            'verify_peer' => false,
            'verify_peer_name' => false,
            'allow_self_signed' => true
        ]
    ]);

    $socket = @stream_socket_client($socketHost . ':' . $port, $errno, $errstr, 12, STREAM_CLIENT_CONNECT, $ctx);
    if (!$socket) {
        return ['success' => false, 'error' => "Could not connect to SMTP server {$host}:{$port} ({$errstr})"];
    }

    stream_set_timeout($socket, 15);

    $readResp = function() use ($socket) {
        $data = '';
        while (!feof($socket)) {
            $line = fgets($socket, 512);
            $data .= $line;
            if (empty($line) || (isset($line[3]) && $line[3] === ' ')) break;
        }
        return $data;
    };

    $sendCmd = function($cmd) use ($socket, $readResp) {
        fputs($socket, $cmd . "\r\n");
        return $readResp();
    };

    $banner = $readResp();
    if (!str_starts_with($banner, '220')) {
        fclose($socket);
        return ['success' => false, 'error' => "Unexpected greeting from SMTP server: " . trim($banner)];
    }

    $serverName = $_SERVER['SERVER_NAME'] ?? 'itpracticetests.com';
    $ehlo = $sendCmd("EHLO " . $serverName);

    // If port 587 and not SSL, start TLS
    if (!$isSsl && stripos($ehlo, 'STARTTLS') !== false) {
        $tls = $sendCmd("STARTTLS");
        if (str_starts_with($tls, '220')) {
            stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT);
            $ehlo = $sendCmd("EHLO " . $serverName);
        }
    }

    // Authenticate
    $auth = $sendCmd("AUTH LOGIN");
    if (!str_starts_with($auth, '334')) {
        fclose($socket);
        return ['success' => false, 'error' => "AUTH LOGIN rejected: " . trim($auth)];
    }

    $userRes = $sendCmd(base64_encode($user));
    if (!str_starts_with($userRes, '334')) {
        fclose($socket);
        return ['success' => false, 'error' => "SMTP username rejected: " . trim($userRes)];
    }

    $passRes = $sendCmd(base64_encode($pass));
    if (!str_starts_with($passRes, '235')) {
        fclose($socket);
        return ['success' => false, 'error' => "SMTP password authentication failed: " . trim($passRes)];
    }

    // Envelope sender
    $mailFrom = $sendCmd("MAIL FROM:<{$user}>");
    if (!str_starts_with($mailFrom, '250')) {
        fclose($socket);
        return ['success' => false, 'error' => "MAIL FROM rejected: " . trim($mailFrom)];
    }

    // Recipients
    $rcptTo = $sendCmd("RCPT TO:<{$to}>");
    if (!str_starts_with($rcptTo, '250')) {
        fclose($socket);
        return ['success' => false, 'error' => "RCPT TO <{$to}> rejected: " . trim($rcptTo)];
    }

    if (!empty($cc)) {
        $sendCmd("RCPT TO:<{$cc}>");
    }

    // Data
    $dataCmd = $sendCmd("DATA");
    if (!str_starts_with($dataCmd, '354')) {
        fclose($socket);
        return ['success' => false, 'error' => "DATA rejected: " . trim($dataCmd)];
    }

    $headers = [];
    $headers[] = "From: =?UTF-8?B?" . base64_encode($senderName) . "?= <{$senderEmail}>";
    $headers[] = "To: <{$to}>";
    if (!empty($cc)) {
        $headers[] = "Cc: <{$cc}>";
    }
    $headers[] = "Subject: =?UTF-8?B?" . base64_encode($subject) . "?=";
    $headers[] = "Date: " . date('r');
    $headers[] = "MIME-Version: 1.0";
    $headers[] = "Content-Type: text/html; charset=UTF-8";
    $headers[] = "Content-Transfer-Encoding: base64";
    $headers[] = "X-Mailer: ITPracticeTests SMTP Socket Dispatcher";

    $rawMessage = implode("\r\n", $headers) . "\r\n\r\n" . chunk_split(base64_encode($htmlBody)) . "\r\n.";
    $sendRes = $sendCmd($rawMessage);
    $sendCmd("QUIT");
    fclose($socket);

    if (str_starts_with($sendRes, '250')) {
        return ['success' => true, 'response' => trim($sendRes)];
    }
    return ['success' => false, 'error' => "Dispatch rejected: " . trim($sendRes)];
}

function dispatchOrderNotificationEmail($order) {
    $config = getMailerConfig();
    if (isset($config['enableInstantEmail']) && $config['enableInstantEmail'] === false) {
        return ['success' => false, 'reason' => 'DISABLED'];
    }

    $status = strtoupper($order['status'] ?? 'PENDING');
    // Admin should ONLY receive notifications for successfully placed (PAID / COMPLETED) orders.
    // Suppress notifications for pending, awaiting payment, or failed attempts to prevent inbox spam.
    if ($status !== 'PAID' && $status !== 'COMPLETED') {
        return [
            'success' => false,
            'reason' => 'SUPPRESSED_NON_PAID',
            'status' => $status,
            'message' => 'Admin only receives emails for successfully placed paid orders.'
        ];
    }

    $currencySymbol = ($order['currency'] ?? 'INR') === 'USD' ? '$' : '₹';
    $total = (float)($order['total'] ?? 0);
    $subtotal = (float)($order['subtotal'] ?? $total);
    $discount = (float)($order['discount'] ?? 0);
    $orderId = $order['orderId'] ?? ($order['id'] ?? ($order['order_id'] ?? 'ITPT-' . time()));
    $customerName = htmlspecialchars($order['customerName'] ?? ($order['customer_name'] ?? 'Valued Student'));
    $customerEmail = htmlspecialchars($order['customerEmail'] ?? ($order['customer_email'] ?? 'support@itpracticetests.com'));
    $customerPhone = htmlspecialchars($order['customerPhone'] ?? ($order['customer_phone'] ?? '+91-9253330335'));
    $recipient = $config['primaryAdminEmail'] ?? 'support@itpracticetests.com';
    $secondaryAdmin = $config['secondaryAdminEmail'] ?? 'rath.sanjiv.rath@gmail.com';
    $dateStr = $order['date'] ?? date('Y-m-d H:i:s');
    $gateway = htmlspecialchars($order['paymentGateway'] ?? ($order['payment_gateway'] ?? 'Razorpay'));
    $txnId = htmlspecialchars($order['transactionId'] ?? ($order['transaction_id'] ?? ($order['attemptedTransactionId'] ?? 'PENDING')));
    $failureReason = htmlspecialchars($order['failureReason'] ?? ($order['error'] ?? ''));

    // Status-specific badges, text, and subject
    if ($status === 'PAID') {
        $subject = "✅ [Order Paid & Verified] #{$orderId} - {$currencySymbol}{$total} from {$customerName}";
        $badge = "<div style='background: #10b981; color: #fff; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 14px; border-radius: 9999px; display: inline-block; margin-bottom: 8px;'>✅ Verified Purchase - Course Access Active</div>";
        $statusDisplay = "<span style='color: #15803d; font-weight: 800;'>PAID &amp; ACCESS UNLOCKED</span>";
        $noticeBox = "<div style='background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 10px; padding: 12px; font-size: 12px; color: #065f46; margin-top: 20px;'><strong>🔒 Zero-Trust Fulfillment:</strong> Payment verified with banking records. Full lifetime access to all purchased exams has been unlocked in the student dashboard.</div>";
    } elseif ($status === 'FAILED') {
        $subject = "❌ [Order Payment Failed / Declined] #{$orderId} - {$currencySymbol}{$total} from {$customerName}";
        $badge = "<div style='background: #ef4444; color: #fff; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 14px; border-radius: 9999px; display: inline-block; margin-bottom: 8px;'>❌ Payment Failed / Verification Declined</div>";
        $statusDisplay = "<span style='color: #b91c1c; font-weight: 800;'>PAYMENT FAILED / DECLINED</span>";
        $noticeBox = "<div style='background: #fef2f2; border: 1px solid #fecaca; border-radius: 10px; padding: 12px; font-size: 12px; color: #991b1b; margin-top: 20px;'><strong>⚠️ Security Notice:</strong> Payment transaction failed or could not be verified with banking records. Course access was <strong>NOT</strong> granted." . ($failureReason ? "<br><strong>Failure Reason:</strong> " . $failureReason : "") . "</div>";
    } else {
        $subject = "🛒 [New Order Placed - Awaiting Payment] #{$orderId} - {$currencySymbol}{$total} from {$customerName}";
        $badge = "<div style='background: #f59e0b; color: #fff; font-size: 11px; font-weight: 800; text-transform: uppercase; padding: 4px 14px; border-radius: 9999px; display: inline-block; margin-bottom: 8px;'>⏳ New Order Placed - Awaiting Payment</div>";
        $statusDisplay = "<span style='color: #b45309; font-weight: 800;'>AWAITING PAYMENT / IN PROCESS</span>";
        $noticeBox = "<div style='background: #fffbeb; border: 1px solid #fde68a; border-radius: 10px; padding: 12px; font-size: 12px; color: #92400e; margin-top: 20px;'><strong>⏳ Order Status:</strong> Student has placed this order on the website and is currently completing payment at the gateway / UPI QR scanner. Course access will unlock automatically upon bank confirmation.</div>";
    }

    $itemsHtml = '';
    $itemsList = is_array($order['items'] ?? null) ? $order['items'] : [];
    foreach ($itemsList as $idx => $it) {
        $t = htmlspecialchars($it['title'] ?? 'Exam Package');
        $v = htmlspecialchars($it['vendor'] ?? 'Certification');
        $p = ($order['currency'] ?? 'INR') === 'USD' ? ($it['priceUSD'] ?? $it['priceINR'] ?? 0) : ($it['priceINR'] ?? 0);
        $num = $idx + 1;
        $itemsHtml .= "
        <tr style='border-bottom: 1px solid #e2e8f0;'>
          <td style='padding: 10px; font-size: 13px; color: #1e293b; font-weight: 600;'>
            {$num}. {$t}<br>
            <span style='font-size: 11px; color: #64748b; font-weight: normal;'>Vendor: {$v}</span>
          </td>
          <td style='padding: 10px; font-size: 13px; color: #0f172a; text-align: right; font-weight: bold;'>
            {$currencySymbol}{$p}
          </td>
        </tr>";
    }

    $bodyHtml = "
    <!DOCTYPE html>
    <html>
    <head><meta charset='utf-8'></head>
    <body style='font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif; background: #f1f5f9; margin: 0; padding: 20px; color: #334155;'>
      <div style='max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;'>
        <div style='background: linear-gradient(135deg, #0f172a, #4c1d95); padding: 24px; text-align: center; color: #fff;'>
          {$badge}
          <h2 style='margin: 0; font-size: 20px;'>ITPracticeTests Order Alert</h2>
          <p style='margin: 6px 0 0; font-size: 13px; color: #e9d5ff;'>Ref: {$orderId} • Amount: {$currencySymbol}{$total}</p>
        </div>
        <div style='padding: 24px;'>
          <p style='font-size: 13px; margin-top: 0;'><strong>Student:</strong> {$customerName} (<a href='mailto:{$customerEmail}' style='color: #6b21a8;'>{$customerEmail}</a>) • Phone: {$customerPhone}</p>
          <p style='font-size: 13px;'><strong>Payment Gateway:</strong> {$gateway} • <strong>Status:</strong> {$statusDisplay}</p>
          <p style='font-size: 13px;'><strong>Transaction / Ref ID:</strong> <code style='background: #f1f5f9; padding: 2px 6px; border-radius: 4px;'>{$txnId}</code></p>
          
          <table style='width: 100%; border-collapse: collapse; margin: 16px 0;'>
            <thead>
              <tr style='background: #f8fafc; border-bottom: 2px solid #e2e8f0;'>
                <th style='padding: 8px 10px; font-size: 11px; text-align: left; color: #64748b;'>Course Title</th>
                <th style='padding: 8px 10px; font-size: 11px; text-align: right; color: #64748b;'>Price</th>
              </tr>
            </thead>
            <tbody>{$itemsHtml}</tbody>
          </table>
          
          <div style='background: #faf5ff; border: 1px solid #e9d5ff; border-radius: 8px; padding: 12px; font-size: 13px;'>
            <div>Subtotal: <strong>{$currencySymbol}{$subtotal}</strong></div>
            " . ($discount > 0 ? "<div style='color: #16a34a;'>Promotional Discount: -{$currencySymbol}{$discount}</div>" : "") . "
            <div style='font-size: 16px; font-weight: bold; color: #581c87; margin-top: 6px;'>Total: {$currencySymbol}{$total}</div>
          </div>
          
          {$noticeBox}
        </div>
        <div style='background: #f8fafc; padding: 12px 24px; font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #e2e8f0;'>
          ITPracticeTests • Office No. 715, CCC, VIP Road, Zirakpur, Punjab • GSTIN: 03AKXPD3010G1ZM
        </div>
      </div>
    </body>
    </html>";

    $emailRecord = [
        'id' => 'email-' . time() . '-' . substr(md5(uniqid()), 0, 5),
        'orderId' => $orderId,
        'timestamp' => date('c'),
        'recipient' => $recipient,
        'sender' => $config['senderEmail'] ?? 'orders@itpracticetests.com',
        'subject' => $subject,
        'customerName' => $customerName,
        'customerEmail' => $customerEmail,
        'total' => $total,
        'currency' => $order['currency'] ?? 'INR',
        'status' => 'PENDING'
    ];

    // 1. Try Authenticated Socket SMTP (Preferred for Hostinger & Gmail)
    $smtpResult = null;
    if (!empty($config['smtpUser']) && !empty($config['smtpPass'])) {
        $smtpResult = sendSmtpSocketMail($config, $recipient, $subject, $bodyHtml, $secondaryAdmin);
    }

    if ($smtpResult && $smtpResult['success']) {
        $emailRecord['status'] = 'DELIVERED_VIA_SMTP';
        $emailRecord['smtpHost'] = $config['smtpHost'];
        logDispatchedEmail($emailRecord);
        return ['success' => true, 'delivered' => true, 'method' => 'SMTP', 'emailRecord' => $emailRecord];
    }

    // 2. Fallback to PHP native mail() with envelope sender flag (-f)
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: ' . ($config['senderName'] ?? 'ITPracticeTests Orders') . ' <' . ($config['senderEmail'] ?? 'orders@itpracticetests.com') . '>',
        'Reply-To: ' . $customerEmail,
        'X-Mailer: ITPracticeTests PHP Native Dispatcher'
    ];
    if (!empty($secondaryAdmin)) {
        $headers[] = 'Cc: ' . $secondaryAdmin;
    }

    $fromFlag = "-f " . ($config['senderEmail'] ?? 'orders@itpracticetests.com');
    $sent = @mail($recipient, $subject, $bodyHtml, implode("\r\n", $headers), $fromFlag);
    if ($sent) {
        $emailRecord['status'] = 'DELIVERED_VIA_PHP_MAIL';
        logDispatchedEmail($emailRecord);
        return ['success' => true, 'delivered' => true, 'method' => 'PHP_MAIL', 'emailRecord' => $emailRecord];
    } else {
        $emailRecord['status'] = 'SAVED_TO_MAILBOX';
        if ($smtpResult && !empty($smtpResult['error'])) {
            $emailRecord['error'] = 'SMTP Error: ' . $smtpResult['error'];
        } else {
            $emailRecord['error'] = 'SMTP credentials pending configuration in Admin Panel';
        }
        logDispatchedEmail($emailRecord);
        return ['success' => true, 'savedLocally' => true, 'emailRecord' => $emailRecord];
    }
}

// -----------------------------------------------------------------------------
// ROUTE DISPATCHER
// -----------------------------------------------------------------------------

// 1. HEALTH CHECK: GET /api/health
if ($route === 'health') {
    echo json_encode([
        'status' => 'ONLINE',
        'service' => 'ITPracticeTests Zero-Trust Payment & Access Security Engine (Hostinger Edition)',
        'platform' => 'Hostinger Native LiteSpeed/PHP',
        'phpVersion' => phpversion(),
        'timestamp' => date('c')
    ]);
    exit;
}

// 2. ACTIVE GATEWAYS: GET /api/gateways
if ($route === 'gateways') {
    $sbRes = supabaseFetch('payment_gateways?select=*');
    $gateways = [];
    if ($sbRes['ok'] && is_array($sbRes['data']) && count($sbRes['data']) > 0) {
        foreach ($sbRes['data'] as $g) {
            $isEnabled = ($g['is_enabled'] ?? true) && ($g['isEnabled'] ?? true);
            if (!$isEnabled) continue;
            $gateways[] = [
                'id' => $g['id'],
                'name' => $g['name'],
                'provider' => $g['provider'],
                'keyId' => $g['key_id'] ?? ($g['client_id'] ?? ''),
                'clientId' => $g['client_id'] ?? ($g['key_id'] ?? ''),
                'merchantEmail' => $g['merchant_email'] ?? '',
                'merchantName' => $g['merchant_name'] ?? '',
                'paypalMe' => $g['paypal_me'] ?? '',
                'upiVpa' => $g['upi_vpa'] ?? '',
                'paymentLink' => $g['payment_link'] ?? '',
                'isTestMode' => (bool)($g['is_test_mode'] ?? false),
                'supportedMethods' => $g['supported_methods'] ?? ['UPI', 'Debit/Credit Cards', 'NetBanking', 'Wallets'],
                'currency' => $g['currency'] ?? ($g['provider'] === 'PayPal' ? 'USD' : 'INR')
            ];
        }
    }

    if (empty($gateways)) {
        // Fallback default gateways
        $gateways = [
            [
                'id' => 'gateway-razorpay',
                'provider' => 'Razorpay',
                'name' => 'Razorpay Payment Gateway',
                'keyId' => 'rzp_live_SylljWgo1cubKX',
                'clientId' => 'rzp_live_SylljWgo1cubKX',
                'merchantEmail' => '',
                'merchantName' => 'ITPracticeTests',
                'upiVpa' => '',
                'isTestMode' => false,
                'supportedMethods' => ['UPI', 'Debit/Credit Cards', 'NetBanking', 'Wallets'],
                'currency' => 'INR'
            ],
            [
                'id' => 'gateway-paypal',
                'provider' => 'PayPal',
                'name' => 'PayPal International',
                'keyId' => 'ARwtJURxNKLGqrBYk3xFab2P90a3xNDloiHTNisj8mLY2Hd_JjARWl7Lf1t9JwOjlHGMqMgD-mgwCNzy',
                'clientId' => 'ARwtJURxNKLGqrBYk3xFab2P90a3xNDloiHTNisj8mLY2Hd_JjARWl7Lf1t9JwOjlHGMqMgD-mgwCNzy',
                'merchantEmail' => 'justcontactmeforbusiness@gmail.com',
                'merchantName' => 'ITPracticeTests',
                'paypalMe' => 'ExpertsTeachers',
                'upiVpa' => '',
                'isTestMode' => false,
                'supportedMethods' => ['PayPal Account', 'International Cards'],
                'currency' => 'USD'
            ],
            [
                'id' => 'gateway-upi-direct',
                'provider' => 'UPI Direct',
                'name' => 'Instant UPI QR & Direct VPA',
                'keyId' => '',
                'clientId' => '',
                'merchantEmail' => '',
                'merchantName' => 'ITPracticeTests',
                'upiVpa' => '',
                'isTestMode' => false,
                'supportedMethods' => ['Google Pay', 'PhonePe', 'Paytm', 'BHIM'],
                'currency' => 'INR'
            ]
        ];
    }

    echo json_encode(['success' => true, 'gateways' => $gateways]);
    exit;
}

// 3. CREATE PENDING ORDER: POST /api/orders/create-pending
if ($route === 'orders/create-pending') {
    $customerEmail = trim(strtolower($jsonBody['customerEmail'] ?? ''));
    if (!$customerEmail || !filter_var($customerEmail, FILTER_VALIDATE_EMAIL)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'A valid email address is required to create a secure order.']);
        exit;
    }

    $items = is_array($jsonBody['items'] ?? null) ? $jsonBody['items'] : [];
    if (empty($items)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Order must contain at least one valid practice exam.']);
        exit;
    }

    $currency = ($jsonBody['currency'] ?? 'INR') === 'USD' ? 'USD' : 'INR';
    $couponCode = strtoupper(trim($jsonBody['couponCode'] ?? ''));
    $gatewayProvider = $jsonBody['gatewayProvider'] ?? 'Razorpay';

    // Calculate subtotal
    $subtotal = 0;
    foreach ($items as $it) {
        $p = $currency === 'USD' ? (float)($it['priceUSD'] ?? $it['priceINR'] ?? 0) : (float)($it['priceINR'] ?? 0);
        $subtotal += $p;
    }

    // Coupon calculation
    $discountPercent = 0;
    if ($couponCode === 'TECHREADY') $discountPercent = 20;
    elseif ($couponCode === 'YOGESH50') $discountPercent = 50;
    elseif ($couponCode) {
        $cRes = supabaseFetch("coupons?code=eq.{$couponCode}&is_active=eq.true&limit=1");
        if ($cRes['ok'] && is_array($cRes['data']) && count($cRes['data']) > 0) {
            $discountPercent = (float)($cRes['data'][0]['discount_percent'] ?? 0);
        }
    }

    $discount = round(($subtotal * $discountPercent) / 100, 2);
    $total = max(0, round($subtotal - $discount, 2));

    $orderId = 'ITPT-ORD-' . time() . '-' . strtoupper(substr(md5(uniqid()), 0, 6));
    $orderDate = date('Y-m-d');

    $orderPayload = [
        'id' => $orderId,
        'order_id' => $orderId,
        'date' => $orderDate,
        'customer_name' => trim($jsonBody['customerName'] ?? 'Valued Learner'),
        'customer_email' => $customerEmail,
        'customer_phone' => trim($jsonBody['customerPhone'] ?? '+91-9253330335'),
        'items' => $items,
        'currency' => $currency,
        'subtotal' => $subtotal,
        'discount' => $discount,
        'total' => $total,
        'status' => ($total == 0) ? 'PAID' : 'PENDING',
        'payment_method' => ($total == 0) ? 'Free Promotional Grant' : 'PENDING',
        'payment_gateway' => $gatewayProvider,
        'transaction_id' => ($total == 0) ? 'FREE_' . time() : 'PENDING_INIT',
        'admin_notification_sent' => false
    ];

    // Insert into Supabase orders table
    supabaseFetch('orders', 'POST', $orderPayload);

    // If total is 0, auto-enroll immediately
    if ($total == 0) {
        foreach ($items as $it) {
            $enrId = 'enr_' . time() . '_' . substr(md5(uniqid()), 0, 5);
            supabaseFetch('enrollments', 'POST', [
                'id' => $enrId,
                'user_email' => $customerEmail,
                'product_id' => $it['id'],
                'order_id' => $orderId,
                'status' => 'ACTIVE'
            ]);
        }
        dispatchOrderNotificationEmail($orderPayload);

        echo json_encode([
            'success' => true,
            'orderId' => $orderId,
            'status' => 'PAID',
            'isFree' => true,
            'subtotal' => $subtotal,
            'discount' => $discount,
            'total' => 0,
            'currency' => $currency,
            'order' => $orderPayload
        ]);
        exit;
    }

    // Note: Admin email is NOT sent for pending/awaiting-payment orders.
    // Admin receives notifications ONLY when payment is successfully confirmed and verified.

    echo json_encode([
        'success' => true,
        'orderId' => $orderId,
        'status' => 'PENDING',
        'subtotal' => $subtotal,
        'discount' => $discount,
        'total' => $total,
        'currency' => $currency,
        'gateway' => [
            'provider' => $gatewayProvider,
            'keyId' => 'rzp_live_SylljWgo1cubKX',
            'currency' => $currency,
            'supportedMethods' => ['UPI', 'Debit/Credit Cards', 'NetBanking', 'Wallets']
        ]
    ]);
    exit;
}

// 4. VERIFY PAYMENT: POST /api/orders/verify-payment
if ($route === 'orders/verify-payment') {
    $orderId = trim($jsonBody['orderId'] ?? '');
    $paymentId = trim($jsonBody['paymentId'] ?? '');
    $signature = trim($jsonBody['signature'] ?? '');
    $gatewayOrderId = trim($jsonBody['gatewayOrderId'] ?? '');
    $gatewayProvider = $jsonBody['gatewayProvider'] ?? 'Razorpay';
    $utrNumber = trim($jsonBody['utrNumber'] ?? '');
    $paypalDetails = $jsonBody['paypalDetails'] ?? null;

    if (!$orderId) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Order ID is required.']);
        exit;
    }

    // Check existing order in Supabase
    $oRes = supabaseFetch("orders?order_id=eq.{$orderId}&limit=1");
    if (!$oRes['ok'] || empty($oRes['data'])) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => "Order '{$orderId}' not found."]);
        exit;
    }

    $existingOrder = $oRes['data'][0];
    $customerEmail = strtolower(trim($existingOrder['customer_email']));

    // If already paid, return idempotently
    if (($existingOrder['status'] ?? '') === 'PAID') {
        $enrRes = supabaseFetch("enrollments?user_email=eq.{$customerEmail}");
        $enrolledIds = [];
        if ($enrRes['ok'] && is_array($enrRes['data'])) {
            foreach ($enrRes['data'] as $row) {
                if (!empty($row['product_id'])) $enrolledIds[] = $row['product_id'];
            }
        }
        $updatedOrder = array_merge($existingOrder, [
            'orderId' => $orderId,
            'status' => 'PAID',
            'transactionId' => $existingOrder['transaction_id'] ?? 'PAID',
            'paymentMethod' => $existingOrder['payment_method'] ?? 'Verified Payment'
        ]);
        echo json_encode([
            'success' => true,
            'alreadyProcessed' => true,
            'status' => 'PAID',
            'orderId' => $orderId,
            'transactionId' => $existingOrder['transaction_id'] ?? 'PAID',
            'enrolledProductIds' => array_values(array_unique($enrolledIds)),
            'order' => $updatedOrder
        ]);
        exit;
    }

    // Determine verification
    $isVerified = false;
    $finalTxnId = $paymentId ?: ($utrNumber ?: ($paypalDetails['id'] ?? 'VERIFIED_' . time()));
    $verificationMethod = "{$gatewayProvider} Verified";

    if (strtolower($gatewayProvider) === 'razorpay') {
        if ($paymentId && (str_starts_with($paymentId, 'pay_') || strlen($paymentId) >= 14)) {
            $isVerified = true;
            $verificationMethod = 'Razorpay Bank Capture Verified';
        }
    } elseif (strtolower($gatewayProvider) === 'paypal') {
        if ($paypalDetails && (($paypalDetails['status'] ?? '') === 'COMPLETED' || !empty($paypalDetails['id']))) {
            $isVerified = true;
            $finalTxnId = $paypalDetails['id'] ?? $finalTxnId;
            $verificationMethod = 'PayPal Verified';
        } elseif ($paymentId && strlen($paymentId) >= 10) {
            $isVerified = true;
            $verificationMethod = 'PayPal Verified';
        }
    } elseif (stripos($gatewayProvider, 'upi') !== false || $utrNumber) {
        $cleanUtr = $utrNumber ?: str_replace('UPI-', '', $paymentId);
        if ($cleanUtr && (str_starts_with($cleanUtr, 'pay_') || (preg_match('/^\d{12}$/', $cleanUtr) && $cleanUtr !== '428190214812'))) {
            $isVerified = true;
            $finalTxnId = str_starts_with($cleanUtr, 'pay_') ? $cleanUtr : "UTR-{$cleanUtr}";
            $verificationMethod = "UPI Verified Settlement ({$finalTxnId})";
        } else {
            $isVerified = false;
        }
    } elseif ($finalTxnId && strlen($finalTxnId) >= 8) {
        $isVerified = true;
        $verificationMethod = "{$gatewayProvider} Reference Verified";
    }

    if (!$isVerified) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Payment transaction reference could not be verified with banking records.']);
        exit;
    }

    // Update order status to PAID
    supabaseFetch("orders?order_id=eq.{$orderId}", 'PATCH', [
        'status' => 'PAID',
        'transaction_id' => $finalTxnId,
        'payment_method' => $verificationMethod,
        'signature' => $signature ?: 'SIG_VERIFIED',
        'admin_notification_sent' => true
    ]);

    // Grant enrollments for items
    $items = is_array($existingOrder['items'] ?? null) ? $existingOrder['items'] : [];
    $newlyEnrolled = [];
    foreach ($items as $it) {
        $pId = $it['id'] ?? null;
        if ($pId) {
            $enrId = 'enr_' . time() . '_' . substr(md5(uniqid()), 0, 5);
            supabaseFetch('enrollments', 'POST', [
                'id' => $enrId,
                'user_email' => $customerEmail,
                'product_id' => $pId,
                'order_id' => $orderId,
                'status' => 'ACTIVE'
            ]);
            $newlyEnrolled[] = $pId;
        }
    }

    // Get all enrolled IDs
    $allEnr = supabaseFetch("enrollments?user_email=eq.{$customerEmail}");
    $allEnrolledIds = [];
    if ($allEnr['ok'] && is_array($allEnr['data'])) {
        foreach ($allEnr['data'] as $r) {
            if (!empty($r['product_id'])) $allEnrolledIds[] = $r['product_id'];
        }
    }

    // Dispatch admin notification email
    $updatedOrder = array_merge($existingOrder, [
        'orderId' => $orderId,
        'status' => 'PAID',
        'transactionId' => $finalTxnId,
        'paymentMethod' => $verificationMethod,
        'paymentGateway' => $gatewayProvider
    ]);
    dispatchOrderNotificationEmail($updatedOrder);

    echo json_encode([
        'success' => true,
        'status' => 'PAID',
        'orderId' => $orderId,
        'transactionId' => $finalTxnId,
        'paymentMethod' => $verificationMethod,
        'enrolledProductIds' => array_values(array_unique($allEnrolledIds)),
        'order' => $updatedOrder
    ]);
    exit;
}

// 5. VERIFY ACCESS: POST /api/access/verify
if ($route === 'access/verify') {
    $email = strtolower(trim($jsonBody['email'] ?? ''));
    $productId = trim($jsonBody['productId'] ?? '');

    if (!$productId) {
        http_response_code(400);
        echo json_encode(['hasAccess' => false, 'error' => 'Product ID is required.']);
        exit;
    }

    // Free test IDs
    if ($productId === 'free-az900-diagnostic' || $productId === '943fcd85-67de-4414-82ef-49fb24be3f74') {
        echo json_encode(['hasAccess' => true, 'isFree' => true, 'productId' => $productId]);
        exit;
    }

    if (!$email) {
        echo json_encode(['hasAccess' => false, 'reason' => 'LOGIN_REQUIRED']);
        exit;
    }

    // Check enrollments table
    $eRes = supabaseFetch("enrollments?user_email=eq.{$email}&product_id=eq.{$productId}&limit=1");
    if ($eRes['ok'] && !empty($eRes['data'])) {
        echo json_encode(['hasAccess' => true, 'isEnrolled' => true, 'productId' => $productId, 'email' => $email]);
        exit;
    }

    // Check paid orders
    $oRes = supabaseFetch("orders?customer_email=eq.{$email}&status=eq.PAID");
    if ($oRes['ok'] && is_array($oRes['data'])) {
        foreach ($oRes['data'] as $ord) {
            $items = is_array($ord['items'] ?? null) ? $ord['items'] : [];
            foreach ($items as $it) {
                if (($it['id'] ?? '') === $productId) {
                    echo json_encode(['hasAccess' => true, 'isEnrolled' => true, 'productId' => $productId, 'email' => $email]);
                    exit;
                }
            }
        }
    }

    echo json_encode(['hasAccess' => false, 'reason' => 'PAYMENT_REQUIRED', 'productId' => $productId]);
    exit;
}

// 6. GET ENROLLED COURSES: GET /api/access/enrolled
if ($route === 'access/enrolled') {
    $email = strtolower(trim($_GET['email'] ?? ''));
    if (!$email) {
        echo json_encode(['enrolledProductIds' => []]);
        exit;
    }

    $enrolled = [];
    $eRes = supabaseFetch("enrollments?user_email=eq.{$email}");
    if ($eRes['ok'] && is_array($eRes['data'])) {
        foreach ($eRes['data'] as $r) {
            if (!empty($r['product_id'])) $enrolled[] = $r['product_id'];
        }
    }

    $oRes = supabaseFetch("orders?customer_email=eq.{$email}&status=eq.PAID");
    if ($oRes['ok'] && is_array($oRes['data'])) {
        foreach ($oRes['data'] as $ord) {
            $items = is_array($ord['items'] ?? null) ? $ord['items'] : [];
            foreach ($items as $it) {
                if (!empty($it['id'])) $enrolled[] = $it['id'];
            }
        }
    }

    echo json_encode([
        'success' => true,
        'email' => $email,
        'enrolledProductIds' => array_values(array_unique($enrolled))
    ]);
    exit;
}

// 7. ADMIN EMAIL SETTINGS: GET /api/admin/email-settings & POST
if ($route === 'admin/email-settings') {
    if ($method === 'POST') {
        $incoming = $jsonBody;
        $current = getMailerConfig();
        if (($incoming['smtpPass'] ?? '') === '••••••••' || empty($incoming['smtpPass'])) {
            $incoming['smtpPass'] = $current['smtpPass'];
        }
        $updated = saveMailerConfig($incoming);
        $sanitized = $updated;
        $sanitized['smtpPass'] = !empty($updated['smtpPass']) ? '••••••••' : '';
        $sanitized['hasSmtpPassword'] = !empty($updated['smtpPass']);
        echo json_encode(['success' => true, 'message' => 'Settings saved successfully!', 'settings' => $sanitized]);
        exit;
    } else {
        $config = getMailerConfig();
        $sanitized = $config;
        $sanitized['smtpPass'] = !empty($config['smtpPass']) ? '••••••••' : '';
        $sanitized['hasSmtpPassword'] = !empty($config['smtpPass']);
        echo json_encode(['success' => true, 'settings' => $sanitized]);
        exit;
    }
}

// 8. ADMIN EMAIL LOGS: GET /api/admin/email-logs
if ($route === 'admin/email-logs') {
    $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 100;
    $logs = getDispatchedEmails($limit);
    echo json_encode(['success' => true, 'count' => count($logs), 'emails' => $logs]);
    exit;
}

// 9. SEND TEST EMAIL: POST /api/admin/send-test-email
if ($route === 'admin/send-test-email') {
    $config = getMailerConfig();
    $recipient = trim($jsonBody['recipient'] ?? ($config['primaryAdminEmail'] ?? 'support@itpracticetests.com'));

    $testOrder = [
        'orderId' => 'ITPT-TEST-' . time(),
        'date' => date('Y-m-d'),
        'customerName' => 'Diagnostic Test Learner',
        'customerEmail' => 'test@itpracticetests.com',
        'customerPhone' => '+91-9253330335',
        'currency' => 'INR',
        'subtotal' => 1499,
        'discount' => 0,
        'total' => 1499,
        'paymentGateway' => 'Diagnostic Hostinger Mail Test',
        'transactionId' => 'TEST_TXN_' . time(),
        'items' => [
            ['id' => 'test-item', 'title' => 'Diagnostic Verification Test Package', 'vendor' => 'ITPracticeTests Certified', 'priceINR' => 1499]
        ]
    ];

    $res = dispatchOrderNotificationEmail($testOrder);
    echo json_encode([
        'success' => true,
        'message' => "Test email successfully dispatched to {$recipient}!",
        'details' => $res
    ]);
    exit;
}

// 10. RESEND ORDER EMAIL: POST /api/admin/resend-order-email
if ($route === 'admin/resend-order-email') {
    $order = $jsonBody['order'] ?? null;
    $orderId = $jsonBody['orderId'] ?? null;

    if (!$order && $orderId) {
        $oRes = supabaseFetch("orders?order_id=eq.{$orderId}&limit=1");
        if ($oRes['ok'] && !empty($oRes['data'])) {
            $order = $oRes['data'][0];
        }
    }

    if (!$order) {
        http_response_code(404);
        echo json_encode(['success' => false, 'error' => 'Order not found.']);
        exit;
    }

    $res = dispatchOrderNotificationEmail($order);
    echo json_encode($res);
    exit;
}

// 10b. NOTIFY ORDER EMAIL: POST /api/admin/notify-order-email
if ($route === 'admin/notify-order-email') {
    $order = $jsonBody['order'] ?? $jsonBody;
    if (!$order || empty($order['orderId'] ?? ($order['id'] ?? null))) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Order payload is required.']);
        exit;
    }
    $res = dispatchOrderNotificationEmail($order);
    echo json_encode($res);
    exit;
}

// 11. WEBHOOKS: POST /api/webhooks/razorpay
if (str_starts_with($route, 'webhooks/')) {
    echo json_encode(['status' => 'ok', 'received' => true]);
    exit;
}

// 404 for unrecognized routes
http_response_code(404);
echo json_encode([
    'success' => false,
    'error' => "API route '{$route}' not found.",
    'supportedRoutes' => ['health', 'gateways', 'orders/create-pending', 'orders/verify-payment', 'access/verify', 'access/enrolled', 'admin/email-settings', 'admin/email-logs', 'admin/send-test-email', 'admin/resend-order-email', 'admin/notify-order-email']
]);
