from playwright.sync_api import sync_playwright

def verify_theme(page):
    print("Navigating to home...")
    page.goto("http://localhost:3000")

    # 1. Verify Login Page & Background
    print("Waiting for Login Page...")
    page.wait_for_selector("text=RobloxGen AI")
    # Take a screenshot of the login page to see the background
    page.screenshot(path="verification/login_page.png")
    print("Login page screenshot taken.")

    # 2. Log in
    print("Logging in...")
    page.fill("input[placeholder='Choose a username...']", "TestUser")
    page.click("button:has-text('Create Account')")

    # Wait for reload/navigation
    # The code does window.location.reload(), so we might need to wait for load event
    page.wait_for_load_state('networkidle')

    # 3. Verify Main Page
    print("Waiting for Main Page...")
    # This text is in the main view
    try:
        page.wait_for_selector("text=What would you like to create?", timeout=10000)
    except:
        print("Main page text not found. Taking debug screenshot...")
        page.screenshot(path="verification/debug_failed_login.png")
        raise

    print("Main page loaded. Taking screenshot...")
    page.screenshot(path="verification/main_page_default.png")

    # 4. Change Theme
    print("Opening Settings...")
    page.click("button[title='Settings']")

    print("Switching to Synthwave theme...")
    page.click("text=Appearance")
    page.click("text=synthwave")

    # Close settings
    page.click("button:has(svg.lucide-x)")

    # Wait for transition
    page.wait_for_timeout(1000)

    print("Taking synthwave screenshot...")
    page.screenshot(path="verification/main_page_synthwave.png")
    print("Verification complete.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch()
        context = browser.new_context()
        page = context.new_page()
        try:
            verify_theme(page)
        except Exception as e:
            print(f"Error: {e}")
        finally:
            browser.close()
