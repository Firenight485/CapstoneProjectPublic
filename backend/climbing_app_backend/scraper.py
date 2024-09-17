# This file works with views that scraper location information off the internet
# We use this to auto generate some our location so the database is not completely empt at first
# This is mainly a testing file, most of these functions are also implemented in scraper_views
from urllib.request import urlopen
import re
import requests
import json
from django.shortcuts import render
from bs4 import BeautifulSoup
from selenium import webdriver
import time
import undetected_chromedriver as uc
from selenium.webdriver.common.by import By 



STATE_NAMES = ["Alaska", "Alabama", "Arkansas", "American Samoa", "Arizona", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Guam", "Hawaii", "Iowa", "Idaho", "Illinois", "Indiana", "Kansas", "Kentucky", "Louisiana", "Massachusetts", "Maryland", "Maine", "Michigan", "Minnesota", "Missouri", "Mississippi", "Montana", "North-Carolina", "North-Dakota", "Nebraska", "New-Hampshire", "New-Jersey", "New-Mexico", "Nevada", "New-York", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto-Rico", "Rhode-Island", "South-Carolina", "South-Dakota", "Tennessee", "Texas", "Utah", "Virginia", "Vermont", "Washington", "Wisconsin", "West-Virginia", "Wyoming", "International"]
ROUTE_NUM_THRESH = 800
BASE_URL = "https://www.mountainproject.com/route-guide"

# Finds the name of the lcoation from the link
def parseUrl(link):
    index = link.rfind("/")
    name = link[index+1:]
    name = name.replace("-", " ")
    name = name.title()
    return name

# This retrieves what state the climbing location in from the html
def get_state(link):
    page = urlopen(link)
    html = page.read().decode("utf-8")
    soup = BeautifulSoup(html, 'html.parser')
    div_paths = soup.find('div', {"class": "mb-half small text-warm"})
    print(div_paths.find_all('a'))
    urls = []
    for url in div_paths.find_all('a'):
        area_url = url.get('href')
        if (area_url is None):
            continue
        if (area_url.find("area") < 0):
            continue
        urls.append(area_url)
    if len(urls) == 0:
        return ""

    return parseUrl(urls[0])

# This gets the types of climbing featured at a sepcifc climbing location
def get_climbing_types(link):
    options = uc.ChromeOptions()
    options.add_argument("--headless") 
    driver = uc.Chrome(options=options)
    driver.get(link)
    html = driver.page_source
    soup = BeautifulSoup(html, 'html.parser')
    svg_path = soup.find('svg', {'aria-label': "A chart."})
    values = svg_path.find_all('g')[0].find_all('g')
    data = []
    for column in values:
        val = column.get("column-id")
        if val is not None:
            data.append(val)

    driver.close()
    return data


def scrap_url(url):
    page = urlopen(url)
    html = page.read().decode("utf-8")

    # Finds the decimal coordinates, Longitude then Latitude for some reason
    coord_pattern = "[+-]?\d+\.\d{1,}\,[+-]?\d+\.\d{1,}"
    coord_results = re.search(coord_pattern, html, re.IGNORECASE)
    if coord_results is None:
        return None
    coords = coord_results.group()
    split = coords.index(",")

    views_pattern = "\d*,?\d*/month"
    views_results = re.search(views_pattern, html, re.IGNORECASE)
    views = views_results.group()
    views = views.replace(",", "")
    num_split = views.index("/")
    views = views[:num_split]
    
    location = {
        "name" : parseUrl(url).rstrip(),
        "latitude": coords[split+1:],
        "longitude": coords[:split+1],
        "monthly_page_views": views,
        "state": get_state(url)
    }
    return location

# Grabs all urls from the base page
def get_area_urls():
    all_urls=[]
    reqs = requests.get(BASE_URL)
    soup = BeautifulSoup(reqs.text, 'html.parser')
    for link in soup.find_all('a'):
        area_link = link.get('href')
        if (area_link is None):
            continue
        if (area_link.find("area") < 0):
            continue
        all_urls.append(area_link)
    return all_urls


#Call for testing
#print(get_area_urls())

def filter_states(url):
    for i in range(len(STATE_NAMES)):
        if url.find(STATE_NAMES[i].lower()) > 0:
            return True
    return False


def filter_dups(urls_array):
    urls_seen = []
    filtered_urls = []
    for i in range(len(urls_array)):
        # Filters outs base State Links
        if filter_states(urls_array[i]):
            continue
        if urls_array[i] not in urls_seen:
            filtered_urls.append(urls_array[i])
            urls_seen.append(urls_array[i])
    return filtered_urls

#print(filter_dups(get_area_urls()))

def scrap_area_info(filtered_urls):
    info = [] 
    file = open("Area_Data.json", "w")
    for i in range(len(filtered_urls)):
        info.append(scrap_url(filtered_urls[i]))
    json.dump(info, file)
    file.close()
    return info
