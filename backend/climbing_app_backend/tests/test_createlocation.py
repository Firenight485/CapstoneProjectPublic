import undetected_chromedriver as uc
from selenium.webdriver.common.by import By 
from selenium.webdriver.common.keys import Keys
import time
from ..models import Location, AppUser

# URL of the frontend
frontend_url = "http://localhost:3000/"

# Define a function to create a location
def create_location_test():
    # Launch browser
    driver = uc.Chrome()
    driver.maximize_window()

    try:
        # Navigate to the frontend URL
        driver.get(frontend_url)
        print("Navigated to the frontend URL.")

        # Wait for the page to load
        time.sleep(2)
        print("Page loaded successfully.")

        # Check if the popup is present
        popup_present = driver.find_elements(By.ID, "popupDialog")
        if popup_present:
            # Close the popup by clicking on the Ok button
            close_button = driver.find_element(By.XPATH, "//Button[contains(text(),'Ok')]")
            close_button.click()
            # Wait for the popup to close
            time.sleep(2)
            print("Popup closed.")
        else:
            print("No popup present.")

        # Check if the login button is present
        profile_button = driver.find_element(By.ID, 'Profile')
        profile_button.click()

        # Wait for the menu to open
        time.sleep(2)

        # Check if the sign-up button is present
        signup_button_present = driver.find_elements(By.ID, 'Sign Up')
        if signup_button_present:
            print("Sign-up button found.")
        else:
            print("Sign-up button not found.")
        # If the sign-up button is present then create account
        driver.find_element(By.ID, 'Sign Up').click()

        # Create account and send the information needed
        time.sleep(5)
        print("Signup modal appeared.")
        email_box = driver.find_element(By.ID, 'Email')
        print("Sending Email")
        email = 'testemail421@gmail.com'
        email_box.send_keys(email)
        username_box = driver.find_element(By.ID, 'Username')
        print("Sending Username")
        username = 'testusername421'
        username_box.send_keys(username)
        password_box = driver.find_element(By.ID, 'Password')
        print("Sending Password")
        password = 'Password123!'
        password_box.send_keys(password)
        driver.find_element(By.ID, 'Create Account').click()
        print('Tried to create account') 

        time.sleep(5)

        assert driver.current_url == frontend_url + 'home'
        print('Account created successfully')
         
        time.sleep(5)

        print("Beginning create location test....")

        top_bar_button = driver.find_element(By.ID, "topBar")
        top_bar_button.click()

        create_location_button = driver.find_element(By.ID, "Create Location")
        create_location_button.click()

        print('Successfully found create location page')

        time.sleep(5)

        #Location details
        name = "Test Location1"
        latitude = "37.77449"  
        longitude = "-122.4194"  
        description = "This is a test location."

        #Filling in the location details
        print("creating location....")
        name_field = driver.find_element(By.CSS_SELECTOR,"input#name_field")
        name_field.send_keys(name)
        latitude_field = driver.find_element(By.CSS_SELECTOR, "input#latitude_field")
        latitude_field.send_keys(latitude)
        longitude_field = driver.find_element(By.CSS_SELECTOR, "input#longitude_field")
        longitude_field.send_keys(longitude)
        description_field = driver.find_element(By.ID, "description_field")
        description_field.send_keys(description)
        stateOption = driver.find_element(By.ID, "state")
        stateOption.click()
        #Moving through the list and entering it into the search box
        stateOption.send_keys(Keys.ARROW_DOWN, Keys.ENTER)
        stateOption = driver.find_element(By.ID, "rock")
        stateOption.click()
        stateOption.send_keys(Keys.ARROW_DOWN, Keys.ENTER)
        stateOption = driver.find_element(By.ID, "diff")
        stateOption.click()
        stateOption.send_keys(Keys.ARROW_DOWN, Keys.ENTER)
        level = driver.find_element(By.CSS_SELECTOR, ".MuiFormControlLabel-root.MuiFormControlLabel-labelPlacementEnd.css-j204z7-MuiFormControlLabel-root")
        level.click()
        print("Details added...")

        #Publishing the location
        publishLoc = driver.find_element(By.ID, 'publishButton')
        publishLoc.click()
        time.sleep(5)

        #Closing the drop down
        close_button = driver.find_element(By.CLASS_NAME, "swal2-confirm")
        close_button.click()
        time.sleep(2)

        #Clean up and deleting all data created during the test 
        try:
            AppUser.objects.filter(username='testusername421').delete()
            Location.objects.filter(name = "Test Location1").delete()
        except:
                pass

        time.sleep(5)


    except Exception as e:
        print("An error occurred:", e)

    finally:
        # Close the browser
        driver.quit()
        print("Browser closed.")

# Call the function to execute the test
create_location_test()
