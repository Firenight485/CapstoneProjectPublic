import undetected_chromedriver as uc
from selenium.webdriver.common.by import By
from climbing_app_backend.models import AppUser,Comment,Location
import time

# URL of the frontend
frontend_url = "http://localhost:3000/"

# Define a function to create a location
def create_comment_test():
    print('NOW TESTING IF YOU CAN CREATE A COMMENT')
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

        driver.find_element(By.ID, 'Sign Up').click()

        time.sleep(5)
        print("Signup modal appeared.")
        email_box = driver.find_element(By.ID, 'Email')
        print("Sending Email")
        email = 'testemail44444444444444444444444444444444444444@gmail.com'
        email_box.send_keys(email)
        username_box = driver.find_element(By.ID, 'Username')
        print("Sending Username")
        username = 'testusername44444444444444444444444444444444444'
        username_box.send_keys(username)
        password_box = driver.find_element(By.ID, 'Password')
        print("Sending Password")
        password = 'Password123!'
        password_box.send_keys(password)
        try:
            AppUser.objects.filter(username=username).delete()
        except:
            print('User could not be created')
        driver.find_element(By.ID, 'Create Account').click()
        print('Tried to create account') 

        time.sleep(5)

        assert driver.current_url == frontend_url + 'home'
        print('Account created successfully')
         
        time.sleep(5)

        print("Beginning create comment test....")

        author = AppUser.objects.get(username=username)
        loc = Location.objects.create(name = 'TEST LOCATION', author = author, description='THIS IS A TEST', latitude =0, longitude=0, state='SC',
                                difficulty_level = 'B', rock_type = 'G', climbing_type= 'Sport' )
        
        print('Created Tesing Location')

        driver.get(frontend_url+"locations/"+loc.name)
        time.sleep(4)
        print('Navigated to Test Location')
        time.sleep(5)
        
        comment_text_box = driver.find_element(By.ID, 'CommentBox')
        comment_text_box.click()
        comment = "Hey! This is a comment"
        print('Typing Comment!')
        comment_text_box.send_keys(comment)
        time.sleep(2)
        driver.find_element(By.XPATH, '/html/body/div[1]/div[2]/div[3]/div[4]/div/div[2]/div/button[2]').click()
        print('Left the comment!')
        time.sleep(10)
        left_comment = driver.find_element(By.CSS_SELECTOR, 'div.MuiBox-root:nth-child(3) > div:nth-child(16) > div:nth-child(2) > p:nth-child(2)')
        assert left_comment.text == comment
        print("Finished create_comment test!")
    except Exception as e:
        print("An error occurred:", e)

    finally:
        # Close the browser
        driver.quit()
        print("Browser closed.")

# Call the function to execute the test
create_comment_test()
