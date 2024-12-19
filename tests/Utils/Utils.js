class LoginHelper {
    /**
     * Logs into the OrangeHRM system using provided credentials.
     * @param {object} page - Playwright page object
     * @param {string} username - User's username
     * @param {string} password - User's password
     */
    static async login(page, username, password) {
        await page.goto('https://opensource-demo.orangehrmlive.com');
        await page.fill('input[name="username"]', username);
        await page.fill('input[name="password"]', password);
        await page.click('button:has-text("Login")');
        await page.waitForSelector('text=Dashboard'); // Ensure login success
    }
}

module.exports = LoginHelper;