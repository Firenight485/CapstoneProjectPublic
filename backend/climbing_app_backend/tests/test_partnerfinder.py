import undetected_chromedriver as uc
from selenium.webdriver.common.by import By 
from selenium.webdriver.common.keys import Keys
import time

from climbing_app_backend.tests.test_signup_logout import signup


# To run, on must have the latest version of chrome/chromium (121 currently) 
# in their PATH. Undetected chromedriver is used so that webdriver
# is automaticcally installed so we do not have to deal with different versions
# of the chromedriver executable between different OS.

frontend_url = "http://localhost:3000/"

options = uc.ChromeOptions()
#options.add_argument("--headless") 
driver = uc.Chrome(options=options)

signup(driver)

# --------------------------------------------------
# actual partner finder testing code
# --------------------------------------------------
driver.get(frontend_url + 'partner_finder')
time.sleep(1)

# open create post box
driver.find_element(By.ID, "fab").click()

text = 'Test post'

# enter post text
driver.find_element(By.ID, 'postContentField').send_keys(text)

# location selector
search_bar_btn = driver.find_element(By.ID, 'searchbar')
search_bar_btn.click()
search_bar_btn.send_keys(Keys.ARROW_UP, Keys.ENTER)

# open difficulty dropdown
diff_dropdown = driver.find_element(By.ID, "diffLevel")
diff_dropdown.click()
# select beginner difficulty
driver.find_element(By.ID, 'Beginner').click()

driver.find_element(By.ID, 'postButton').click()

time.sleep(1)

# if user signed up, they should be logged in
driver.find_element(By.ID, 'Profile').click()
driver.find_element(By.ID, 'Logout').click()

assert text in driver.page_source

driver.close()
driver.quit()

