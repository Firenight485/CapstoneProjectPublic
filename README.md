# Crux Conditions
This app is a tool for outdoor rock climbers to use to find good climbing destinations based on criteria they put in, 
as well as external factors such as weather </br>
For a more detailed description, visit: </br>
https://github.com/SCCapstone/Briattoshu/wiki/Project-Description </br>

## External Requirements

### pipenv
First, make sure you have python and pip installed. You can use the following commands to check </br>
</br>**python --version**</br>
</br>**pip --version**</br>
</br>Once pip and python are installed you can execute the following:</br>
</br>**pip install pipenv --user**</br>
</br>To upgrade pipenv use the following:</br>
</br>**pip install --user upgrade pipenv**</br>

### npm
To install npm, open the terminal and execute the follwing in the command line:</br>
</br>**sudo apt install nodejs**</br>
</br>Then:</br>
</br>**sudo apt install npm**</br>

### Django
To install Django, which this project uses as it's backend, do the following: </br>
</br>**pipenv shell**</br>
</br>Then:</br>
</br>**python -m install Django**</br>

## Setup

## Running

## Deployment

## Coding Style Guides
https://google.github.io/styleguide/htmlcssguide.html</br>
https://google.github.io/styleguide/pyguide.html</br>
https://google.github.io/styleguide/tsguide.html</br>

# Testing

## Running Tests
**NOTE**</br>
Make sure you have Chrome/Chromium version 121 (latest) in your system path.</br>
On Ubuntu the easist thing to do is simply use **snap install chromium**</br>

All tests are located in the directory Briattoshu/backend/climbing_app_backend/tests</br></br>
To run the tests, you need to run the frontend and backed. </br>

To run the backend use the command **pipenv shell** in the Briattoshu/backend/ directory</br>

Make sure to download the requirements.txt file with the following: </br>
**pip install -r requirements.txt**</br>

Then run the commands **python manage.py makemigrations** and **python manage.py migrate**</br>

Then use the command **python manage.py runserver**</br>

Open up a new terminal and navigate to Briattoshu/frontend/ and use the command **npm install** followed by **npm run dev** </br>

Then open a new terminal and go to Braittoshu/backend/ and use the command **pipenv shell** and **python manage.py test**</br>

Tests should run

# Authors

**William Novak-Condy**(@novakwenshu): WWN@email.sc.edu</br>
**Joshua Dietrich**(@DietrichJD): JDD10@email.sc.edu</br>
**Matthew Grenier**(@grematt): MGRENIER@email.sc.edu</br>
**Brian Bongermino**(@Firenight485): BONGERMB@email.sc.edu</br>
**Peter Butkus**(@PeterButkus): PBUTKUS@email.sc.edu</br>

# Deployment

**Backend:** https://crux-conditions-backend.azurewebsites.net/admin</br>
**Frontend:** https://salmon-smoke-0136c8b0f.4.azurestaticapps.net/
