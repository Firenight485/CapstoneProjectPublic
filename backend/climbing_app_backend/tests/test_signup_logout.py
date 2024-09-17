import undetected_chromedriver as uc
from selenium.webdriver.common.by import By 
import time

from ..models import AppUser


# To run, on must have the latest version of chrome/chromium (124 currently) 
# in their PATH. Undetected chromedriver is used so that webdriver
# is automaticcally installed so we do not have to deal with different versions
# of the chromedriver executable between different OS.

frontend_url = "http://localhost:3000/"

def signup(driver):
  # delete account if it already exists
  try:
    AppUser.objects.filter(username='testusername').delete()
  except:
    pass

  driver.get(frontend_url) 

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
  # wait for any http requests to complete
  time.sleep(2)

  print('Navigated to ' + frontend_url)
  driver.find_element(By.ID, 'Profile').click()
  driver.find_element(By.ID, 'Sign Up').click()

  # wait in case page needs to compile
  time.sleep(5)

  email_box = driver.find_element(By.ID, 'Email')
  username_box = driver.find_element(By.ID, 'Username')
  password_box = driver.find_element(By.ID, 'Password')

  email = 'testemail@gmail.com'
  username = 'testusername'
  password = 'Password123**'

  email_box.send_keys(email)
  username_box.send_keys(username)
  password_box.send_keys(password)

  driver.find_element(By.ID, 'Create Account').click()
  print('Tried to create account')

  time.sleep(3)

  # if signup succeeds, user is taken to home
  assert driver.current_url == frontend_url + 'home'
  print('Account created successfully')

def logout(driver):
  # if user signed up, they should be logged in
  driver.find_element(By.ID, 'Profile').click()
  driver.find_element(By.ID, 'Logout').click()

  # after logged out, user should be redirected home
  assert driver.current_url == frontend_url + 'home'
  print('Logged out successfully')

  driver.close()
  driver.quit()

options = uc.ChromeOptions()
#options.add_argument("--headless") 
driver = uc.Chrome(options=options)
signup(driver)
logout(driver)