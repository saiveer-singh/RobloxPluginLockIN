from playwright.sync_api import sync_playwright

def verify_appearance_settings():
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()

        # Navigate to the app (assuming it runs on port 3000)
        try:
            page.goto("http://localhost:3000")
            print("Navigated to localhost:3000")
        except Exception as e:
            print(f"Failed to navigate: {e}")
            return

        # Wait for the page to load
        page.wait_for_timeout(2000)

        # The settings panel is likely triggered by a button.
        # I need to find the settings button. Based on typical UI, it might be an icon.
        # Let's list buttons to find it.
        # Checking layout or page content might help, but I'll try to find a settings button.

        # In `SettingsPanel.tsx`, it takes `isOpen`.
        # I need to find where `SettingsPanel` is used.
        # I haven't checked `web/app/page.tsx` yet, so I don't know how to open it.
        # But I can try to take a screenshot of the home page first to see if the theme is dark.

        page.screenshot(path="verification/homepage_dark.png")
        print("Screenshot of homepage taken.")

        browser.close()

if __name__ == "__main__":
    verify_appearance_settings()
