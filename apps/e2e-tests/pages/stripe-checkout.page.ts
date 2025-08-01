import { Page, expect, Locator } from '@playwright/test';
import { BasePage } from './base.page';

export class StripeCheckoutPage extends BasePage {
  // Locator constants - organized at the top
  private static readonly LOCATORS = {
    // Main containers
    PAYMENT_FORM: '#payment-form',
    ORDER_SUMMARY: '[data-testid="order-summary-column"]',
    
    // Payment method selection
    CARD_RADIO_BUTTON: 'input[name="payment-method-accordion-item-title"][value="card"]',
    CARD_ACCORDION_ITEM: '[data-testid="card-accordion-item"]',
    CARD_ACCORDION_BUTTON: '.AccordionItemHeader--clickable >> nth=0',

    
    // Express checkout (to skip)
    EXPRESS_CHECKOUT_ELEMENT: '[data-testid="express-checkout-element"]',
    
    // Link signup form
    LINK_CHECKBOX: 'input[name="enableStripePass"]',
    PHONE_NUMBER_INPUT: 'input[name="phoneNumber"]',
    COUNTRY_SELECT: '.PhoneNumberCountryCodeSelect-select',
    
    // Submit button
    SUBMIT_BUTTON: '[data-testid="hosted-payment-submit-button"]',
    
    // Card input fields (direct in DOM - no iframe needed!)
    CARD_NUMBER_INPUT: '#cardNumber',
    CARD_EXPIRY_INPUT: '#cardExpiry', 
    CARD_CVC_INPUT: '#cardCvc',
    
    // Billing information fields
    CARDHOLDER_NAME_INPUT: '#billingName',
    BILLING_COUNTRY_SELECT: '#billingCountry',
    BILLING_ADDRESS_LINE1_INPUT: '#billingAddressLine1',
    BILLING_ADDRESS_LINE2_INPUT: '#billingAddressLine2',
    BILLING_CITY_INPUT: '#billingLocality',
    BILLING_STATE_SELECT: '#billingAdministrativeArea',
    BILLING_POSTAL_CODE_INPUT: '#billingPostalCode',
    
  };

  // Test address data
  private static readonly TEST_ADDRESS = {
    line1: '123 Main Street',
    line2: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    postalCode: '10001'
  };

  // Page elements
  private readonly paymentForm: Locator;
  private readonly cardAccordionButton: Locator;
  private readonly submitButton: Locator;
  private readonly linkCheckbox: Locator;
  private readonly phoneNumberInput: Locator;
  
  // Card input elements
  private readonly cardNumberInput: Locator;
  private readonly cardExpiryInput: Locator;
  private readonly cardCvcInput: Locator;
  private readonly cardholderNameInput: Locator;
  private readonly billingCountrySelect: Locator;
  private readonly billingPostalCodeInput: Locator;
  
  // Billing address elements
  private readonly billingAddressLine1Input: Locator;
  private readonly billingAddressLine2Input: Locator;
  private readonly billingCityInput: Locator;
  private readonly billingStateSelect: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize all elements
    this.paymentForm = this.page.locator(StripeCheckoutPage.LOCATORS.PAYMENT_FORM);
    this.cardAccordionButton = this.page.locator(StripeCheckoutPage.LOCATORS.CARD_ACCORDION_BUTTON);
    this.submitButton = this.page.locator(StripeCheckoutPage.LOCATORS.SUBMIT_BUTTON);
    this.linkCheckbox = this.page.locator(StripeCheckoutPage.LOCATORS.LINK_CHECKBOX);
    this.phoneNumberInput = this.page.locator(StripeCheckoutPage.LOCATORS.PHONE_NUMBER_INPUT);
    
    // Card input elements
    this.cardNumberInput = this.page.locator(StripeCheckoutPage.LOCATORS.CARD_NUMBER_INPUT);
    this.cardExpiryInput = this.page.locator(StripeCheckoutPage.LOCATORS.CARD_EXPIRY_INPUT);
    this.cardCvcInput = this.page.locator(StripeCheckoutPage.LOCATORS.CARD_CVC_INPUT);
    this.cardholderNameInput = this.page.locator(StripeCheckoutPage.LOCATORS.CARDHOLDER_NAME_INPUT);
    this.billingCountrySelect = this.page.locator(StripeCheckoutPage.LOCATORS.BILLING_COUNTRY_SELECT);
    this.billingPostalCodeInput = this.page.locator(StripeCheckoutPage.LOCATORS.BILLING_POSTAL_CODE_INPUT);
    
    // Billing address elements
    this.billingAddressLine1Input = this.page.locator(StripeCheckoutPage.LOCATORS.BILLING_ADDRESS_LINE1_INPUT);
    this.billingAddressLine2Input = this.page.locator(StripeCheckoutPage.LOCATORS.BILLING_ADDRESS_LINE2_INPUT);
    this.billingCityInput = this.page.locator(StripeCheckoutPage.LOCATORS.BILLING_CITY_INPUT);
    this.billingStateSelect = this.page.locator(StripeCheckoutPage.LOCATORS.BILLING_STATE_SELECT);
  }

  /**
   * Wait for Stripe checkout page to load
   */
  async expectToBeOnCheckoutPage(): Promise<void> {
    await expect(this.page).toHaveURL(/checkout\.stripe\.com/);
    await this.paymentForm.waitFor({ state: 'visible', timeout: 15000 });
  }

  /**
   * Select Card as the payment method by clicking the accordion header
   */
  async selectCardPaymentMethod(): Promise<void> {
    console.log('Selecting card payment method...');
    
    // Wait for card accordion button to be available
    await this.cardAccordionButton.waitFor({ state: 'visible', timeout: 10000 });
    
    // Click the card accordion button to expand the card form
    await this.cardAccordionButton.click();
    
    // Wait a moment for the card form to expand/load
    await this.page.waitForTimeout(1000);
    
    // Verify card inputs are now visible
    await this.cardNumberInput.waitFor({ state: 'visible', timeout: 5000 });
    
    console.log('Card payment method selected and form expanded');
  }

  /**
   * Fill in test credit card information
   */
  async fillCardDetails(): Promise<void> {
    console.log('Filling card details...');
    
    const testCardNumber = '4242424242424242';
    const testExpiry = '12/28';
    const testCvc = '123';

    await this.cardNumberInput.fill(testCardNumber);
    await this.cardExpiryInput.fill(testExpiry);
    await this.cardCvcInput.fill(testCvc);
    
    console.log('Card details filled successfully');
  }

  /**
   * Fill cardholder name
   */
  async fillCardholderName(name: string = 'Test User'): Promise<void> {
    try {
      if (await this.cardholderNameInput.isVisible({ timeout: 2000 })) {
        await this.cardholderNameInput.fill(name);
        console.log('Cardholder name filled');
      }
    } catch (error) {
      console.log('Cardholder name field not found or not required');
    }
  }

  /**
   * Fill billing postal code
   */
  async fillPostalCode(postalCode: string = '12345'): Promise<void> {
    try {
      if (await this.billingPostalCodeInput.isVisible({ timeout: 2000 })) {
        await this.billingPostalCodeInput.fill(postalCode);
        console.log('Postal code filled');
      }
    } catch (error) {
      console.log('Postal code field not found or not required');
    }
  }

  /**
   * Select billing country (optional)
   */
  async selectBillingCountry(countryCode: string = 'US'): Promise<void> {
    try {
      if (await this.billingCountrySelect.isVisible({ timeout: 2000 })) {
        await this.billingCountrySelect.selectOption(countryCode);
        console.log(`Billing country set to ${countryCode}`);
      }
    } catch (error) {
      console.log('Country selection not required or not found');
    }
  }

  /**
   * Fill billing address with test address data
   */
  async fillBillingAddress(): Promise<void> {
    const address = StripeCheckoutPage.TEST_ADDRESS;
    
    try {
      // Fill address line 1
      if (await this.billingAddressLine1Input.isVisible({ timeout: 2000 })) {
        await this.billingAddressLine1Input.fill(address.line1);
        console.log('Billing address line 1 filled');
      }
      
      // Fill address line 2 (optional)
      if (address.line2 && await this.billingAddressLine2Input.isVisible({ timeout: 2000 })) {
        await this.billingAddressLine2Input.fill(address.line2);
        console.log('Billing address line 2 filled');
      }
      
      // Fill city
      if (await this.billingCityInput.isVisible({ timeout: 2000 })) {
        await this.billingCityInput.fill(address.city);
        console.log('Billing city filled');
      }
      
      // Select state
      if (await this.billingStateSelect.isVisible({ timeout: 2000 })) {
        await this.billingStateSelect.selectOption(address.state);
        console.log('Billing state selected');
      }
      
      // Fill postal code (reuse existing method)
      await this.fillPostalCode(address.postalCode);
      
    } catch (error) {
      console.log('Some billing address fields not found or not required');
    }
  }

  /**
   * Fill phone number for Link (optional)
   */
  async fillPhoneNumber(phoneNumber: string = '2015550123'): Promise<void> {
    try {
      if (await this.phoneNumberInput.isVisible({ timeout: 2000 })) {
        await this.phoneNumberInput.fill(phoneNumber);
        console.log('Phone number filled for Link');
      }
    } catch (error) {
      console.log('Phone number field not found or not required');
    }
  }

  /**
   * Handle Link checkbox (usually pre-checked)
   */
  async handleLinkCheckbox(shouldEnable: boolean = true): Promise<void> {
    try {
      if (await this.linkCheckbox.isVisible({ timeout: 2000 })) {
        const isChecked = await this.linkCheckbox.isChecked();
        if (isChecked !== shouldEnable) {
          await this.linkCheckbox.click();
        }
        console.log(`Link checkbox ${shouldEnable ? 'enabled' : 'disabled'}`);
      }
    } catch (error) {
      console.log('Link checkbox not found');
    }
  }

  /**
   * Submit the payment form
   */
  async submitPayment(): Promise<void> {
    console.log('Submitting payment...');
    
    // Wait for submit button to be enabled
    await this.submitButton.waitFor({ state: 'visible', timeout: 5000 });
    
    // Click submit button
    await this.submitButton.click();
    
    console.log('Payment submitted');
  }

  /**
   * Handle any 3D Secure authentication
   */
  async handle3DSecure(): Promise<void> {
    try {
      // Wait for potential 3D Secure iframe
      await this.page.waitForSelector('iframe[name*="stripe"], iframe[src*="3ds"]', { timeout: 5000 });
      
      // Look for complete/authorize button
      const completeButton = this.page.getByRole('button', { name: /complete|authorize|confirm/i });
      if (await completeButton.isVisible({ timeout: 3000 })) {
        await completeButton.click();
        console.log('3D Secure completed');
      }
    } catch (error) {
      console.log('No 3D Secure challenge detected');
    }
  }

  /**
   * Wait for successful payment and redirect
   */
  async expectPaymentSuccess(): Promise<void> {
    console.log('Waiting for payment success...');
    
    // Wait for redirect back to the app
    await this.page.waitForURL(/localhost|\.vercel\.app|\.com/, { timeout: 30000 });
    await this.waitForLoadState();
    
    console.log('Payment completed successfully');
  }

  /**
   * Complete the full checkout flow
   */
  async completeTestCheckout(): Promise<void> {
    // 1. Verify we're on Stripe checkout
    await this.expectToBeOnCheckoutPage();
    
    // 2. Select card as payment method (expand the accordion)
    await this.selectCardPaymentMethod();
    
    // 3. Fill card details
    await this.fillCardDetails();
    
    // 4. Fill cardholder name
    await this.fillCardholderName();
    
    // 5. Fill postal code if present
    await this.fillPostalCode();
    
    // 6. Fill billing address
    await this.fillBillingAddress();
    
    // 7. Select country if needed
    await this.selectBillingCountry();
    
    // 8. Optionally fill phone number for Link
    await this.fillPhoneNumber();
    
    // 9. Handle Link checkbox
    await this.handleLinkCheckbox();
    
    // 10. Submit payment
    await this.submitPayment();
    
    // 11. Handle 3D Secure if needed
    await this.handle3DSecure();
    
    // 12. Wait for successful completion
    await this.expectPaymentSuccess();
  }
}