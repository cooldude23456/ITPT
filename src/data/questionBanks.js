// Rich authentic practice exam questions with scenario-based MCQs, MSQs, explanations, and official references
export const questionBanks = {
  // Free AZ-900 Diagnostic Mock Test
  'free-az900-diagnostic': [
    {
      id: 'az900-q1',
      domain: 'Cloud Concepts',
      type: 'single', // single or multiple
      question: 'Which cloud computing model offers the highest level of administrative control and flexibility over the operating system, storage, and deployed applications?',
      options: [
        'Software as a Service (SaaS)',
        'Platform as a Service (PaaS)',
        'Infrastructure as a Service (IaaS)',
        'Serverless Computing'
      ],
      correctAnswers: [2],
      explanation: 'Infrastructure as a Service (IaaS) gives the customer complete control over operating system installation, patching, network routing, and server configurations. PaaS manages the underlying OS and runtime, while SaaS is fully managed by the cloud vendor.',
      reference: 'https://learn.microsoft.com/en-us/azure/cloud-adoption-framework/strategy/cloud-services'
    },
    {
      id: 'az900-q2',
      domain: 'Azure Architecture & Services',
      type: 'multiple',
      question: 'Which TWO characteristics are true regarding Azure Availability Zones? (Choose TWO)',
      options: [
        'Each Availability Zone is made up of one or more physical datacenters with independent power, cooling, and networking.',
        'Availability Zones are available in every Azure region across the world without exception.',
        'Availability Zones protect applications from entire region-wide catastrophic disasters across hundreds of miles.',
        'Availability Zones are connected to each other through a high-speed, private fiber-optic network with round-trip latency under 2 milliseconds.'
      ],
      correctAnswers: [0, 3],
      explanation: 'Availability Zones are physically separate locations within an Azure region, each equipped with dedicated power, cooling, and network. They are linked via ultra-low latency fiber networks (<2ms). Option B is false because not all regions support AZs. Option C is false because protection against regional disaster requires paired regions or cross-region replication.',
      reference: 'https://learn.microsoft.com/en-us/azure/reliability/availability-zones-overview'
    },
    {
      id: 'az900-q3',
      domain: 'Azure Management & Governance',
      type: 'single',
      question: 'An enterprise wants to enforce a rule that prevents IT teams from deploying virtual machines in any region other than "Central India" and "South India". Which Azure service should be used?',
      options: [
        'Azure Role-Based Access Control (Azure RBAC)',
        'Azure Policy',
        'Azure Key Vault',
        'Azure Bastion'
      ],
      correctAnswers: [1],
      explanation: 'Azure Policy is designed specifically for governance and compliance rules (e.g., Allowed Locations, Allowed VM SKUs, Required Tags). Azure RBAC controls "who" can perform actions, but Azure Policy controls "what" can be deployed.',
      reference: 'https://learn.microsoft.com/en-us/azure/governance/policy/overview'
    },
    {
      id: 'az900-q4',
      domain: 'Security & Identity',
      type: 'single',
      question: 'What is the primary function of Microsoft Entra ID (formerly Azure Active Directory)?',
      options: [
        'To filter network traffic between virtual subnets using stateful firewall rules.',
        'To provide a cloud-based identity and access management service for authentication and authorization.',
        'To store and manage SSL/TLS certificates and encryption secrets in dedicated Hardware Security Modules (HSMs).',
        'To monitor infrastructure performance and generate alerts based on metric thresholds.'
      ],
      correctAnswers: [1],
      explanation: 'Microsoft Entra ID is Microsoft\'s universal cloud-based identity and access management solution that handles user authentication, Single Sign-On (SSO), Multi-Factor Authentication (MFA), and Conditional Access.',
      reference: 'https://learn.microsoft.com/en-us/entra/fundamentals/whatis'
    },
    {
      id: 'az900-q5',
      domain: 'Cost Management',
      type: 'single',
      question: 'Which Azure tool allows an organization to estimate their expected monthly cloud infrastructure costs BEFORE deploying any resources into production?',
      options: [
        'Azure Cost Management + Billing',
        'Azure Pricing Calculator',
        'Azure Total Cost of Ownership (TCO) Calculator',
        'Azure Advisor'
      ],
      correctAnswers: [1],
      explanation: 'The Azure Pricing Calculator is used to configure and estimate costs for individual products prior to provisioning. Azure TCO Calculator compares on-premises datacenter costs against Azure. Azure Cost Management analyzes actual incurred costs.',
      reference: 'https://azure.microsoft.com/en-us/pricing/calculator/'
    }
  ],

  // AWS SAA-C03 (AWS Certified Solutions Architect Associate)
  '00796cff-0a93-40fe-a22a-44433794233d': [
    {
      id: 'aws-saa-q1',
      domain: 'Design Resilient Architectures',
      type: 'single',
      question: 'A company runs an e-commerce website on an Auto Scaling group of Amazon EC2 instances behind an Application Load Balancer (ALB). During sudden flash sales, orders are placed concurrently, resulting in database lock contention on Amazon Aurora MySQL. Which architectural change should the solutions architect recommend to decouple order processing and eliminate database bottlenecks?',
      options: [
        'Increase the Aurora MySQL read replicas count from 2 to 15.',
        'Deploy an Amazon Simple Queue Service (Amazon SQS) FIFO queue between the web tier and worker instances processing orders.',
        'Migrate the database to Amazon DynamoDB with on-demand capacity.',
        'Place an Amazon ElastiCache for Redis cluster in front of the web servers.'
      ],
      correctAnswers: [1],
      explanation: 'Using Amazon SQS FIFO (First-In-First-Out) queues introduces asynchronous, decoupled message buffering that absorbs traffic spikes without overwhelming the transactional database. It guarantees exactly-once processing and strict order preservation.',
      reference: 'https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/FIFO-queues.html'
    },
    {
      id: 'aws-saa-q2',
      domain: 'Design High-Performing Architectures',
      type: 'single',
      question: 'A media company distributes 4K video clips to millions of users worldwide from an Amazon S3 bucket. Users in Asia report high latency and buffering when downloading content hosted in the us-east-1 region. What is the most cost-effective solution to improve download speeds globally?',
      options: [
        'Enable S3 Cross-Region Replication (CRR) to duplicate files into ap-south-1 and ap-southeast-1 buckets.',
        'Deploy an Amazon CloudFront distribution with the S3 bucket configured as the origin.',
        'Enable S3 Transfer Acceleration on the us-east-1 bucket.',
        'Migrate video assets to Amazon Elastic File System (Amazon EFS) with Multi-AZ mounts.'
      ],
      correctAnswers: [1],
      explanation: 'Amazon CloudFront is a global Content Delivery Network (CDN) with hundreds of edge locations. It caches static video clips near end users, reducing latency and buffering while significantly lowering S3 data transfer out egress charges.',
      reference: 'https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Introduction.html'
    },
    {
      id: 'aws-saa-q3',
      domain: 'Design Secure Applications and Architectures',
      type: 'multiple',
      question: 'A company needs to ensure that all data written to an Amazon S3 bucket is encrypted using keys that are strictly managed and rotated by the internal compliance team. Auditing must capture every single time an encryption key is used. Which TWO configurations satisfy these requirements? (Choose TWO)',
      options: [
        'Use Server-Side Encryption with Customer-Provided Keys (SSE-C).',
        'Use Server-Side Encryption with AWS KMS keys (SSE-KMS) with Customer Managed Keys (CMKs).',
        'Enable AWS CloudTrail to log all AWS KMS cryptographic API operations (such as GenerateDataKey and Decrypt).',
        'Use Server-Side Encryption with Amazon S3-Managed Keys (SSE-S3).',
        'Enable S3 Object Lock in compliance mode.'
      ],
      correctAnswers: [1, 2],
      explanation: 'SSE-KMS with Customer Managed Keys (CMKs) allows full control over key rotation policy, IAM key policies, and grants. Furthermore, all key usage events are logged to AWS CloudTrail, providing the necessary audit trail for compliance. SSE-S3 does not provide audit logs per key usage.',
      reference: 'https://docs.aws.amazon.com/AmazonS3/latest/userguide/UsingKMSEncryption.html'
    },
    {
      id: 'aws-saa-q4',
      domain: 'Design Cost-Optimized Architectures',
      type: 'single',
      question: 'A financial analytics job runs nightly for exactly 3 hours between 1:00 AM and 4:00 AM UTC. The job processes large datasets, can tolerate node terminations by checkpointing state to S3 every 5 minutes, and must be executed at the lowest possible cost. Which EC2 purchasing option is best suited?',
      options: [
        'EC2 Savings Plans with a 3-year all-upfront commitment.',
        'EC2 Spot Instances managed within an Auto Scaling group with capacity-optimized allocation strategy.',
        'On-Demand EC2 Instances with auto-stop scripts.',
        'EC2 Dedicated Hosts with annual reservations.'
      ],
      correctAnswers: [1],
      explanation: 'EC2 Spot Instances offer discounts up to 90% compared to On-Demand pricing. Since the analytics workload is fault-tolerant and saves state every 5 minutes, it is the ideal candidate for Spot capacity.',
      reference: 'https://aws.amazon.com/ec2/spot/'
    }
  ],

  // CompTIA SecurityX CAS-005 Practice Tests
  '15f206c0-8577-431c-83d5-f411f9a763e0': [
    {
      id: 'cas005-q1',
      domain: 'Security Architecture',
      type: 'single',
      question: 'An enterprise is designing a Zero Trust Architecture (ZTA) for hybrid workforce access. Which component of the NIST SP 800-207 Zero Trust model is responsible for making the final access authorization decision based on enterprise policy and continuous contextual telemetry?',
      options: [
        'Policy Enforcement Point (PEP)',
        'Policy Decision Point (PDP) / Policy Engine (PE)',
        'Continuous Diagnostics and Mitigation (CDM) System',
        'Public Key Infrastructure (PKI) Authority'
      ],
      correctAnswers: [1],
      explanation: 'In NIST SP 800-207, the Policy Engine (part of the Policy Decision Point or PDP) is responsible for evaluating access requests against corporate policies, user identity, device posture, and threat intelligence before instructing the PEP to grant or deny access.',
      reference: 'https://csrc.nist.gov/publications/detail/sp/800-207/final'
    },
    {
      id: 'cas005-q2',
      domain: 'Cloud & Hybrid Security',
      type: 'single',
      question: 'A DevSecOps engineer wants to protect microservices communicating inside a Kubernetes cluster against Man-In-The-Middle (MITM) eavesdropping and enforce strict cryptographic pod-to-pod identity without modifying existing application source code. Which technology should be implemented?',
      options: [
        'Kubernetes NetworkPolicy with Calico CNI',
        'Service Mesh (such as Istio or Linkerd) with automatic Mutual TLS (mTLS)',
        'Web Application Firewall (WAF) deployed as an Ingress Controller',
        'IPsec tunnels between cluster worker nodes'
      ],
      correctAnswers: [1],
      explanation: 'A Service Mesh injects sidecar proxies (like Envoy) alongside container pods. The sidecars transparently handle mutual TLS (mTLS) encryption, SPIFFE/SPIRE cryptographic identities, and certificate rotation without requiring any changes to application code.',
      reference: 'https://istio.io/latest/docs/concepts/security/'
    },
    {
      id: 'cas005-q3',
      domain: 'Cryptography & Threat Mitigation',
      type: 'multiple',
      question: 'Which TWO cryptographic mechanisms provide Post-Quantum Cryptography (PQC) resistance against future quantum computing attacks (such as Shor\'s algorithm)? (Choose TWO)',
      options: [
        'RSA-4096 asymmetric encryption',
        'CRYSTALS-Kyber (ML-KEM) lattice-based key encapsulation',
        'Elliptic Curve Diffie-Hellman (ECDH) on Curve25519',
        'CRYSTALS-Dilithium (ML-DSA) lattice-based digital signatures',
        'Diffie-Hellman Key Exchange with 2048-bit prime moduli'
      ],
      correctAnswers: [1, 3],
      explanation: 'NIST selected CRYSTALS-Kyber (ML-KEM) for general encryption/KEM and CRYSTALS-Dilithium (ML-DSA) for digital signatures as quantum-resistant lattice-based standards. Traditional RSA, ECC, and DH are completely vulnerable to Shor\'s algorithm on large-scale quantum computers.',
      reference: 'https://csrc.nist.gov/projects/post-quantum-cryptography'
    }
  ],

  // Microsoft DP-600 Fabric Analytics Engineer
  '0c3d74a7-fba1-4b13-b309-b3ad518d5ae7': [
    {
      id: 'dp600-q1',
      domain: 'Plan, Implement, and Manage a Solution for Data Analytics',
      type: 'single',
      question: 'In Microsoft Fabric, which core storage architectural paradigm allows multiple analytics engines (Spark, SQL Endpoint, Power BI Direct Lake) to access the exact same underlying Delta Parquet files in OneLake without data movement or replication?',
      options: [
        'OneLake Shortcuts',
        'Direct Lake Mode with Delta Lake open format',
        'Azure Data Factory Copy Activity',
        'PolyBase External Tables'
      ],
      correctAnswers: [1],
      explanation: 'Microsoft Fabric leverages OneLake with the Delta Lake open storage format. Power BI Direct Lake mode queries Delta Parquet files directly from OneLake memory without requiring data import or real-time SQL translation, delivering sub-second performance across billions of rows.',
      reference: 'https://learn.microsoft.com/en-us/fabric/get-started/direct-lake-overview'
    },
    {
      id: 'dp600-q2',
      domain: 'Prepare and Cleanse Data',
      type: 'single',
      question: 'You need to create a medallion architecture in Microsoft Fabric. Which layer is responsible for storing cleaned, enriched, deduplicated data modeled as Kimball dimensional star schemas or wide aggregated tables?',
      options: [
        'Bronze layer (Raw)',
        'Silver layer (Cleaned & Conformed)',
        'Gold layer (Business Aggregate / Dimensional)',
        'Platinum layer (Archived)'
      ],
      correctAnswers: [2],
      explanation: 'In the Medallion Architecture, Bronze contains raw ingested data, Silver represents cleaned and validated data, and Gold stores curated business-level aggregated data organized into star schemas (fact and dimension tables) ready for analytics and reporting.',
      reference: 'https://learn.microsoft.com/en-us/fabric/onelake/onelake-medallion-architecture'
    }
  ],

  // Top 600+ Java Developer Interview Questions
  '6729937c-075f-468f-b9ac-d186df7f5a94': [
    {
      id: 'java-int-q1',
      domain: 'Core Java & Concurrency',
      type: 'single',
      question: 'What is the primary difference between `CompletableFuture` and traditional `Future` in Java?',
      options: [
        '`CompletableFuture` is synchronous, while `Future` is strictly asynchronous.',
        '`CompletableFuture` supports non-blocking functional chaining (such as `thenApply`, `thenCompose`), manual completion, and exception handling without blocking on `.get()`.',
        '`CompletableFuture` can only run on virtual threads introduced in Java 21.',
        '`Future` allows cancelling running threads gracefully, whereas `CompletableFuture` cannot be cancelled.'
      ],
      correctAnswers: [1],
      explanation: 'Traditional `Future` required blocking calls (`.get()`) to retrieve results, preventing reactive composition. `CompletableFuture` (introduced in Java 8) provides a fluent, non-blocking asynchronous programming model allowing tasks to be combined, transformed, and handled via callbacks.',
      reference: 'https://docs.oracle.com/en/java/javase/17/docs/api/java.base/java/util/concurrent/CompletableFuture.html'
    },
    {
      id: 'java-int-q2',
      domain: 'JVM Internals & Garbage Collection',
      type: 'single',
      question: 'In Java 17+, what is the default Garbage Collector for 64-bit server configurations, and what is its primary design goal?',
      options: [
        'ZGC (Z Garbage Collector) - sub-millisecond pauses for multi-terabyte heaps.',
        'G1 (Garbage-First) GC - balances high throughput with predictable, low pause times by partitioning the heap into equal-sized regions.',
        'Parallel GC - maximize batch computation throughput without pause time guarantees.',
        'Serial GC - single-threaded GC optimized for low-memory microservices.'
      ],
      correctAnswers: [1],
      explanation: 'The G1 (Garbage-First) GC has been the default GC since Java 9. It partitions the heap into equal regions and prioritizes collecting regions with the most garbage first, fulfilling user-specified pause-time goals while maintaining high throughput.',
      reference: 'https://docs.oracle.com/en/java/javase/17/gctuning/garbage-first-garbage-collector.html'
    },
    {
      id: 'java-int-q3',
      domain: 'Spring Boot & Microservices',
      type: 'single',
      question: 'When implementing the Saga Pattern in distributed microservices, which approach relies on a centralized orchestrator telling participants what local transactions to execute and when to trigger compensating transactions?',
      options: [
        'Choreography-based Saga',
        'Orchestration-based Saga',
        'Two-Phase Commit (2PC)',
        'Event Sourcing CQRS'
      ],
      correctAnswers: [1],
      explanation: 'In Orchestration-based Saga, a central Saga Orchestrator coordinates transaction execution, sends commands to participating services, waits for completion events, and coordinates compensating transactions if an error occurs.',
      reference: 'https://microservices.io/patterns/data/saga.html'
    }
  ],

  // Top 800+ QA Automation & Selenium Interview Questions
  'e1419c59-11b9-4561-877d-8e97b7825c79': [
    {
      id: 'qa-int-q1',
      domain: 'Selenium WebDriver Architecture',
      type: 'single',
      question: 'In Selenium 4, how does the client communicate with browser drivers (ChromeDriver, GeckoDriver) compared to Selenium 3?',
      options: [
        'Selenium 4 continues to wrap all HTTP commands in the legacy JSON Wire Protocol.',
        'Selenium 4 adopts the W3C WebDriver Standard natively without JSON Wire Protocol encoding/decoding, improving stability and execution speed.',
        'Selenium 4 requires WebSocket connections exclusively through Chrome DevTools Protocol (CDP).',
        'Selenium 4 uses gRPC for remote binary transfers.'
      ],
      correctAnswers: [1],
      explanation: 'Selenium 4 fully adheres to the official W3C WebDriver recommendation. In Selenium 3, requests were translated between JSON Wire Protocol and W3C standard. In Selenium 4, both browser and driver communicate directly via standardized W3C protocols.',
      reference: 'https://www.selenium.dev/documentation/webdriver/troubleshooting/upgrade_to_selenium_4/'
    },
    {
      id: 'qa-int-q2',
      domain: 'Test Automation Frameworks',
      type: 'single',
      question: 'Why is `WebDriverWait` (Explicit Wait) preferred over `Thread.sleep()` and `implicitlyWait` in enterprise test automation suites?',
      options: [
        '`WebDriverWait` freezes the operating system process to let AJAX calls complete.',
        '`WebDriverWait` polls the DOM at regular intervals (default 500ms) until an `ExpectedCondition` is met or timeout expires, resuming execution immediately without unnecessary delay.',
        '`WebDriverWait` only works with headless browsers.',
        '`implicitlyWait` can be configured dynamically per test step while `WebDriverWait` is strictly global.'
      ],
      correctAnswers: [1],
      explanation: '`WebDriverWait` is dynamic and non-blocking: as soon as the expected condition (visibility, clickability, presence) becomes true, execution resumes immediately. `Thread.sleep` halts the thread unconditionally, causing massive test suite bloat and instability.',
      reference: 'https://www.selenium.dev/documentation/webdriver/waits/'
    }
  ]
};

// Fallback question generator supporting up to 6 Practice Tests with max 250 questions per test
export function getQuestionsForProduct(productId, productTitle, testNumber = 1) {
  const tNum = Math.max(1, Math.min(6, parseInt(testNumber) || 1));

  // If specific bank is registered for this productId
  if (questionBanks[productId]) {
    const bank = questionBanks[productId];
    // If bank has more questions, slice by testNumber or return up to 250 questions
    return bank.slice(0, 250);
  }

  const title = productTitle || 'IT Certification Practice Exam';

  // Domain objectives tailored to Practice Tests 1 to 6
  const testObjectives = {
    1: {
      name: 'Full-Length Exam Simulation: Architecture & Principles',
      domainA: 'Domain 1: Core Architecture & Compute Services',
      domainB: 'Domain 2: Network Connectivity & Transit Gateways',
      domainC: 'Domain 3: High Availability & Multi-AZ Resiliency'
    },
    2: {
      name: 'High Availability, Disaster Recovery & Redundancy',
      domainA: 'Domain 1: Disaster Recovery & Automated Failover',
      domainB: 'Domain 2: Stateful & Stateless Workload Scaling',
      domainC: 'Domain 3: Storage Tiering & Replication Policies'
    },
    3: {
      name: 'Multi-Select MSQs & Complex Scenario Troubleshooting',
      domainA: 'Domain 1: Diagnostic Log Analysis & Root Cause Isolation',
      domainB: 'Domain 2: Distributed Tracing & Application Bottlenecks',
      domainC: 'Domain 3: Network Latency & Throttling Mitigation'
    },
    4: {
      name: 'Security, Identity, Cryptography & Governance',
      domainA: 'Domain 1: Zero Trust Architecture & Least Privilege IAM',
      domainB: 'Domain 2: Key Management, KMS Rotation & Envelope Encryption',
      domainC: 'Domain 3: Compliance Auditing, CloudTrail & SIEM Ingestion'
    },
    5: {
      name: 'Cost Optimization, Capacity Planning & Sizing',
      domainA: 'Domain 1: Right-Sizing Compute & Memory Workloads',
      domainB: 'Domain 2: Commitment Discounts (Savings Plans & Reserved)',
      domainC: 'Domain 3: Lifecycle Management & Cold Archive Tiers'
    },
    6: {
      name: 'Final Timed Benchmark Mock Exam',
      domainA: 'Domain 1: Comprehensive Multi-Tier Architecture',
      domainB: 'Domain 2: Enterprise Security & Data Protection',
      domainC: 'Domain 3: Reliability, Operations & Disaster Recovery'
    }
  };

  const obj = testObjectives[tNum] || testObjectives[1];

  return [
    {
      id: `${productId}-t${tNum}-q1`,
      testNumber: tNum,
      domain: obj.domainA,
      type: 'single',
      questionType: 'Multi-choice',
      question: `[Practice Test ${tNum}] In a mission-critical enterprise production workload for ${title}, which architectural approach best satisfies zero recovery point objective (RPO = 0) and minimal recovery time objective (RTO < 1 min)?`,
      options: [
        'Synchronous multi-region / multi-availability zone database clustering with automated heartbeat health checks and automatic DNS failover routing.',
        'Single standalone database instance with daily nightly backup snapshots copied to tape storage archives.',
        'Manual intervention using DNS text records updated by on-call engineers during an outage event.',
        'Rely entirely on browser client-side caching without backend database replication.'
      ],
      optionExplanations: [
        'Correct. Synchronous Multi-AZ active-passive or active-active replication ensures zero transactional data loss (RPO = 0) with automatic failover in seconds.',
        'Incorrect. Daily snapshots mean up to 24 hours of data loss (RPO = 24h) and high downtime (RTO hours).',
        'Incorrect. Manual DNS changes suffer from TTL caching delays across public resolvers and slow human reaction times.',
        'Incorrect. Client caching cannot preserve server-side state or handle transactional database continuity.'
      ],
      correctAnswers: [0],
      explanation: 'Synchronous replication across independent physical availability zones guarantees zero data loss (RPO = 0). Automated health probes combined with auto-failover DNS satisfy stringent RTO sub-minute recovery.',
      overallExplanation: 'High-availability enterprise architectures require synchronous replication across separate failure domains to achieve RPO = 0.',
      reference: 'https://itpracticetests.com'
    },
    {
      id: `${productId}-t${tNum}-q2`,
      testNumber: tNum,
      domain: obj.domainB,
      type: 'single',
      questionType: 'Multi-choice',
      question: `[Practice Test ${tNum}] According to zero trust security standards in ${title}, how should an administrator configure access for engineering team members requiring privileged administrative access?`,
      options: [
        'Share a universal root account master password among all senior staff via an encrypted text file.',
        'Enforce the Principle of Least Privilege (PoLP) using Role-Based Access Control (RBAC), Multi-Factor Authentication (MFA), and Just-In-Time (JIT) short-lived privilege elevation.',
        'Grant permanent superuser administrative rights to all developers to avoid access ticket bottlenecks.',
        'Disable administrative audit logging to conserve SIEM ingestion and cloud storage costs.'
      ],
      optionExplanations: [
        'Incorrect. Shared accounts eliminate individual non-repudiation and violate compliance frameworks (SOC2, ISO27001).',
        'Correct. PoLP with RBAC, mandatory MFA, and temporary JIT temporary credential issuance limits exposure and mitigates privilege creep.',
        'Incorrect. Excessive standing permissions create severe risk of credential compromise and insider threats.',
        'Incorrect. Audit logs are non-negotiable for compliance and security forensics.'
      ],
      correctAnswers: [1],
      explanation: 'The principle of least privilege ensures users receive only the exact permissions necessary for their duties. Combining RBAC, mandatory MFA, and temporary JIT privilege elevation mitigates the risk of credential compromise.',
      overallExplanation: 'Zero Trust demands explicit verification, least-privileged access, and continuous auditing for all administrative privileges.',
      reference: 'https://itpracticetests.com'
    },
    {
      id: `${productId}-t${tNum}-q3`,
      testNumber: tNum,
      domain: obj.domainC,
      type: 'multiple',
      questionType: 'Multi-select',
      question: `[Practice Test ${tNum}] When diagnosing intermittent latency spikes and connection drops in a microservices deployment relating to ${title}, which TWO diagnostic actions should a lead engineer immediately execute? (Choose TWO)`,
      options: [
        'Analyze distributed tracing spans (e.g. OpenTelemetry, Jaeger, AWS X-Ray) to identify slow downstream database queries and third-party API delays.',
        'Inspect system metrics and kernel telemetry across pods to isolate whether the bottleneck is CPU starvation, memory leak, network socket exhaustion, or disk I/O wait.',
        'Immediately wipe and reformat production storage volumes without taking diagnostic memory dumps.',
        'Disable TLS/SSL encryption across all internal services to reduce cryptographic CPU overhead.',
        'Increase container resource requests to 100x without diagnosing the underlying deadlock.'
      ],
      optionExplanations: [
        'Correct. Distributed tracing visualizes the end-to-end request lifecycle and pinpoints high-latency spans.',
        'Correct. Metric telemetry identifies resource saturation such as CPU throttling, memory limits (OOM kills), and socket depletion.',
        'Incorrect. Destructive actions destroy diagnostic evidence and induce catastrophic downtime.',
        'Incorrect. Disabling TLS creates severe security vulnerabilities and does not fix thread contention.',
        'Incorrect. Arbitrarily over-provisioning hides code bugs and drastically inflates operational expenditure.'
      ],
      correctAnswers: [0, 1],
      explanation: 'Systematic troubleshooting requires analyzing telemetry metrics (CPU, RAM, disk I/O, network) and tracing application spans to identify exact bottleneck sources before making changes. Destructive actions without diagnostics violate change management standards.',
      overallExplanation: 'Root cause isolation combines distributed tracing spans with infrastructure telemetry metrics before modifying runtime parameters.',
      reference: 'https://itpracticetests.com'
    },
    {
      id: `${productId}-t${tNum}-q4`,
      testNumber: tNum,
      domain: obj.domainA,
      type: 'single',
      questionType: 'Multi-choice',
      question: `[Practice Test ${tNum}] What is the most effective operational strategy to continuously optimize infrastructure costs for production workloads in ${title} without degrading performance?`,
      options: [
        'Overprovision all compute instances to 400% peak capacity at all times.',
        'Implement automated right-sizing telemetry, data lifecycle archival policies, and commitment discounts (Savings Plans / Reserved Instances) for baseline compute.',
        'Never upgrade runtime environments, container images, or underlying database engines.',
        'Store all historical log archives on expensive ultra-high IOPS solid-state storage volumes.'
      ],
      optionExplanations: [
        'Incorrect. Constant 400% over-provisioning wastes budget and provides no resiliency advantages.',
        'Correct. Right-sizing aligns resources to actual utilization, lifecycle rules move cold data to low-cost storage tiers, and commitment discounts slash baseline costs.',
        'Incorrect. Outdated software accumulates performance bugs and critical security vulnerabilities.',
        'Incorrect. Historical logs rarely read should reside on low-cost object archival tiers (e.g. S3 Glacier, Azure Archive).'
      ],
      correctAnswers: [1],
      explanation: 'Continuous cost optimization involves analyzing resource utilization metrics to right-size instances, transitioning cold data to low-cost archival tiers, and locking in discounts for baseline steady-state capacity.',
      overallExplanation: 'A well-architected cloud strategy balances right-sizing, automated lifecycle archival, and commitment plans for baseline steady workloads.',
      reference: 'https://itpracticetests.com'
    }
  ].slice(0, 250); // Enforce maximum 250 questions per practice test
}
