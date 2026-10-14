export const interviewBanks = [
  {
    id: 'selenium-java',
    title: 'Top Selenium + Java Interview Questions & Answers',
    badge: 'High Demand',
    category: 'QA Automation',
    level: 'Mid to Senior',
    questionsCount: 45,
    description: 'Master essential Java and Selenium WebDriver interview questions asked at top tech companies, product startups, and MNCs.',
    questions: [
      {
        id: 'sj-1',
        topic: 'Selenium Architecture',
        question: 'Explain how Selenium 4 WebDriver communicates with the browser and what changed from Selenium 3.',
        difficulty: 'Intermediate',
        talkingPoints: [
          'Direct W3C standard protocol adoption without JSON Wire Protocol encapsulation',
          'Elimination of performance bottlenecks and flaky driver handshakes',
          'Native integration with Chrome DevTools Protocol (CDP) for network interception, performance logs, and geolocation emulation'
        ],
        idealAnswer: `In Selenium 3, the test scripts communicated via the JSON Wire Protocol, which had to be encoded into HTTP requests, sent to the browser driver, and translated to W3C format for the browser. This double-translation often led to flakiness.

In Selenium 4, WebDriver is completely compliant with the official W3C WebDriver specification. Both the client language bindings and the browser driver communicate directly in W3C format. Additionally, Selenium 4 introduced native support for CDP (Chrome DevTools Protocol) through the 'DevTools' interface, enabling advanced capabilities like mocking network responses, simulating offline mode, capturing console logs, and overriding geolocation.`,
        codeSnippet: `// Example: Capturing DevTools Network Logs in Selenium 4
DevTools devTools = ((ChromeDriver) driver).getDevTools();
devTools.createSession();
devTools.send(Network.enable(Optional.empty(), Optional.empty(), Optional.empty()));
devTools.addListener(Network.responseReceived(), response -> {
    System.out.println("Status: " + response.getResponse().getStatus());
});`
      },
      {
        id: 'sj-2',
        topic: 'StaleElementReferenceException',
        question: 'What is a StaleElementReferenceException in Selenium, and how do you prevent or handle it effectively in a Page Object Model (POM)?',
        difficulty: 'Senior',
        talkingPoints: [
          'DOM re-rendering, AJAX pagination, single-page application route change',
          'Element is destroyed and re-created with a different internal DOM node ID',
          'Resolution: Dynamic re-finding, WebDriverWait expected conditions, custom retry loops'
        ],
        idealAnswer: `A StaleElementReferenceException occurs when a referenced element is no longer attached to the DOM. This happens when the DOM is re-rendered (e.g. via React or AJAX update) after the element was located, or the page navigated away and returned.

To handle it effectively in enterprise frameworks:
1. Re-locate the element immediately prior to action instead of caching stale WebElement references in instance variables.
2. Use WebDriverWait with ExpectedConditions.refreshed(ExpectedConditions.elementToBeClickable(locator)).
3. In robust helper wrappers, implement a retry mechanism that catches StaleElementReferenceException and re-executes the search up to 3 attempts.`,
        codeSnippet: `// Robust retry helper for stale elements
public static boolean retryingFindClick(WebDriver driver, By by) {
    boolean result = false;
    int attempts = 0;
    while(attempts < 3) {
        try {
            driver.findElement(by).click();
            result = true;
            break;
        } catch(StaleElementReferenceException e) {
            attempts++;
        }
    }
    return result;
}`
      },
      {
        id: 'sj-3',
        topic: 'Java Concurrency in Parallel Execution',
        question: 'How do you ensure Thread Safety when executing TestNG tests in parallel with WebDriver?',
        difficulty: 'Senior / Lead',
        talkingPoints: [
          'Avoid static WebDriver instances',
          'Utilize ThreadLocal<WebDriver> for thread-isolated driver storage',
          'Proper teardown in @AfterMethod to avoid memory leaks'
        ],
        idealAnswer: `If you use a static WebDriver instance across parallel TestNG threads, test executions will collide, closing each other's windows or sending keystrokes to wrong browser sessions.

The industry-standard solution is to encapsulate the driver in a ThreadLocal<WebDriver>:
1. Create a DriverManager class with private static ThreadLocal<WebDriver> driver = new ThreadLocal<>();
2. Provide synchronized getDriver(), setDriver(WebDriver webDriver), and unload() methods.
3. In TestNG's @BeforeMethod, instantiate the driver and set it into the ThreadLocal.
4. In @AfterMethod, quit the driver and call driver.remove() to prevent thread-pool memory leaks.`,
        codeSnippet: `public class DriverFactory {
    private static ThreadLocal<WebDriver> tlDriver = new ThreadLocal<>();

    public static synchronized void setDriver(WebDriver driver) {
        tlDriver.set(driver);
    }

    public static synchronized WebDriver getDriver() {
        return tlDriver.get();
    }

    public static synchronized void quitDriver() {
        if (tlDriver.get() != null) {
            tlDriver.get().quit();
            tlDriver.remove();
        }
    }
}`
      }
    ]
  },
  {
    id: 'playwright-typescript',
    title: 'Playwright + TypeScript Interview Mastery',
    badge: 'Trending 2026',
    category: 'Modern QA & Dev',
    level: 'All Levels',
    questionsCount: 40,
    description: 'Crack modern test automation interviews covering Playwright auto-waiting, fixtures, API testing, trace viewer, and CI/CD parallelization.',
    questions: [
      {
        id: 'pw-1',
        topic: 'Auto-waiting & Locators',
        question: 'How does Playwright’s auto-waiting mechanism work, and why does it eliminate the need for manual sleep statements?',
        difficulty: 'Intermediate',
        talkingPoints: [
          'Actionability checks before every interaction',
          'Checks: Attached to DOM, Visible, Stable (not animating), Receives Events, Enabled',
          'Timeout safety with default 30s auto-retry'
        ],
        idealAnswer: `Playwright performs a comprehensive set of actionability checks on elements before executing any action (such as click, fill, check).

Specifically, for a click action, Playwright automatically verifies that the element:
1. Is attached to the DOM
2. Is visible (non-zero bounding box, no display:none or opacity:0)
3. Is stable (not currently undergoing CSS transitions or layout shifts)
4. Can receive pointer events (not obscured by sticky headers or modals)
5. Is enabled (not disabled via attribute)

If any check fails, Playwright retries continuously until the condition is met or the timeout occurs, completely rendering manual sleep statements and fragile custom wait loops obsolete.`,
        codeSnippet: `// Playwright auto-waits for #submit-btn to become actionable:
await page.locator('#submit-btn').click();

// Filling text also auto-waits for editable state:
await page.locator('input[name="email"]').fill('engineer@itpracticetests.com');`
      },
      {
        id: 'pw-2',
        topic: 'Test Fixtures & Isolation',
        question: 'Explain Playwright Test Fixtures and how they achieve browser context isolation between tests.',
        difficulty: 'Senior',
        talkingPoints: [
          'Browser Context vs Browser Instance (incognito-like lightweight separation)',
          'Sub-millisecond creation time compared to spinning up a new browser',
          'Custom fixture creation for authenticated state and database seeding'
        ],
        idealAnswer: `In Playwright, a Browser Context is an isolated incognito profile within a single running browser process. Instead of launching a heavy Chrome process for every test (which takes 2-4 seconds), Playwright launches one browser process and creates fresh Browser Contexts in just a few milliseconds.

Each context has its own independent cookies, localStorage, session storage, and cache, ensuring zero state pollution between concurrent tests. Custom fixtures allow developers to package reusable test setup (such as pre-authenticated storage states or API clients) cleanly and inject them into test functions on demand.`,
        codeSnippet: `import { test as base } from '@playwright/test';

// Extend base test with an authenticated admin fixture
export const test = base.extend<{ adminPage: Page }>({
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: 'admin-auth.json' });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});`
      }
    ]
  },
  {
    id: 'python-dev',
    title: 'Top Python Developer & System Design Interview Questions',
    badge: 'Popular',
    category: 'Software Engineering',
    level: 'Senior',
    questionsCount: 50,
    description: 'High-frequency interview questions on Python GIL, AsyncIO, generators, memory management, and microservice architectures.',
    questions: [
      {
        id: 'py-1',
        topic: 'Python GIL & Concurrency',
        question: 'Explain the Global Interpreter Lock (GIL) in CPython. When does it impact performance, and what are the workarounds in modern Python?',
        difficulty: 'Senior',
        talkingPoints: [
          'CPython reference counting memory safety',
          'Only one thread executes Python bytecode at a time',
          'CPU-bound vs I/O-bound differences',
          'Solutions: multiprocessing, asyncio, C extensions, Python 3.13 free-threaded build'
        ],
        idealAnswer: `The Global Interpreter Lock (GIL) is a mutex in CPython that prevents multiple native threads from executing Python bytecode simultaneously. It exists primarily because CPython's memory management relies on reference counting, which is not inherently thread-safe.

Impact:
- For I/O-bound tasks (network requests, database queries, file reading), the GIL is released during system calls, so threading or asyncio works effectively.
- For CPU-bound tasks (data processing, encryption, machine learning), standard multithreading cannot utilize multi-core CPUs because the GIL serializes execution.

Workarounds:
1. Use the 'multiprocessing' module or Celery to spawn separate OS processes with independent memory spaces.
2. Offload heavy calculations to compiled C/Rust extensions (like NumPy, Polars, PyO3).
3. In Python 3.13+, adopt the experimental free-threaded (PEP 703) mode which removes the GIL.`,
        codeSnippet: `from multiprocessing import Pool

def compute_heavy_task(data_chunk):
    # Runs in parallel across multiple CPU cores without GIL bottleneck
    return sum(x * x for x in data_chunk)

if __name__ == '__main__':
    with Pool() as pool:
        results = pool.map(compute_heavy_task, chunks)`
      }
    ]
  }
];
