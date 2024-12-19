
const { test, expect } = require('@playwright/test');
const LoginHelper = require('../tests/Utils/Utils');

const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Utility function to generate random strings
function getRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Utility function to generate random employee ID
function getRandomEmployeeID() {
    return Math.floor(1000 + Math.random() * 9000).toString(); // Generates a random 4-digit number
}

// Function to download an image from a URL and save it locally
async function downloadImage(url, filename) {
    const filePath = path.resolve(__dirname, filename);
    const writer = fs.createWriteStream(filePath);
    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream',
    });

    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
        writer.on('finish', () => resolve(filePath));
        writer.on('error', reject);
    });
}

// Utility function to get a random profile image URL
function getRandomProfileImage() {
    const images = [
        'https://randomuser.me/api/portraits/men/1.jpg',
        'https://randomuser.me/api/portraits/men/2.jpg',
        'https://randomuser.me/api/portraits/men/3.jpg',
        'https://randomuser.me/api/portraits/women/1.jpg',
        'https://randomuser.me/api/portraits/women/2.jpg',
        'https://randomuser.me/api/portraits/women/3.jpg',
    ];
    return images[Math.floor(Math.random() * images.length)];
}

test.describe('OrangeHRM Employee', () => {
    let page;

    // Log in before each test
    test.beforeEach(async ({ browser }) => {
        page = await browser.newPage();
        await LoginHelper.login(page, 'Admin', 'admin123'); // Perform login
    });

    test('1. Add a new Employee with Random Mandatory Details and Profile Picture', async () => {
        // Navigate to the PIM module
        await page.getByRole('link', { name: 'PIM' }).click();

        // Click the Add button
        await page.getByRole('button', { name: ' Add' }).click();

        // Generate random user details
        const firstName = getRandomString(6); // Random first name (6 characters)
        const middleName = getRandomString(6); // Random middle name (6 characters)
        const lastName = getRandomString(8);   // Random last name (8 characters)
        const employeeID = getRandomEmployeeID(); // Random 4-digit employee ID
        const profileImage = getRandomProfileImage(); // Random profile image URL

        // Log generated random details
        console.log(`Generated Employee Details:`);
        console.log(`First Name: ${firstName}`);
        console.log(`Middle Name: ${middleName}`);
        console.log(`Last Name: ${lastName}`);
        console.log(`Employee ID: ${employeeID}`);

        // Download the profile image
        const localImagePath = await downloadImage(profileImage, 'profile.jpg');

        // Upload the downloaded profile image
        await page.locator('input[type="file"]').setInputFiles(localImagePath);

        // Fill in user details
        await page.getByPlaceholder('First Name').fill(firstName);
        await page.getByPlaceholder('Middle Name').fill(middleName);
        await page.getByPlaceholder('Last Name').fill(lastName);

        // Fill in employee ID
        await page.locator('form').getByRole('textbox').nth(4).fill(employeeID);

        // Save the employee
        await page.getByRole('button', { name: 'Save' }).click();

        // Wait for success message
        await page.waitForSelector('text=SuccessSuccessfully Saved');

        // Verify the Personal Details page
        await page.getByRole('heading', { name: 'Personal Details' }).click();

        // Wait for the full name to be visible
        await page.locator('h6.oxd-text.oxd-text--h6.--strong').waitFor({ state: 'visible' });
        const displayedFullName = await page.locator('h6.oxd-text.oxd-text--h6.--strong').innerText();

        // Verify user details
        const fullName = `${firstName} ${lastName}`;
        console.log(`Full Name: ${fullName}`);
        console.log(`Displayed Full Name: ${displayedFullName}`);

        expect(displayedFullName).toContain(fullName);

        // Check if the user already exists
        const userExists = await page.locator(`text=${fullName}`).count() > 0;

        if (userExists) {
            console.log('User already exists, no need to add again.');
        } else {
            console.log('New user added successfully.');
        }

        // Search the Employee, Edit, Save
        // Navigate to the PIM module
        await page.getByRole('link', { name: 'PIM' }).click();

        // Search for the employee by Employee ID
        await page.getByPlaceholder('Type for hints...').first().fill(fullName);
        await page.getByRole('button', { name: 'Search' }).click();
        //await page.locator('.oxd-button--secondary.orangehrm-left-space').click();

        await page.waitForTimeout(9000);
        // // Edit the employee's details
        // await page.locator('button.oxd-icon-button .oxd-icon.bi-pencil-fill').click(); // Assuming this button opens the edit form
        //
        // // Update Employee Details
        // const newNationality = 'Burkinabe'; // Example nationality
        // const newMaritalStatus = 'Married';
        //
        // await page.locator('label').filter({ hasText: 'Nationality' }).locator('span').click();
        // await page.getByRole('option', { name: newNationality }).click();
        // await page.locator('label').filter({ hasText: 'Marital Status' }).locator('span').click();
        // await page.getByRole('option', { name: newMaritalStatus }).click();
        // await page.locator('label').filter({ hasText: 'Date of Birth' }).locator('i').click();
        // await page.locator('li').filter({ hasText: '2024' }).locator('i').click(); // Adjust date picker logic if needed
        // await page.getByText('2001').click();
        // await page.getByText('15').click();
        //
        // // Save the changes
        // await page.getByRole('button', { name: 'Save' }).click();
        //
        // // Verify success message
        // await page.waitForSelector('text=Success Successfully Updated');
    });
});