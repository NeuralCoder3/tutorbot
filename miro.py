import dropbox
import uuid
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.firefox.options import Options as FirefoxOptions
import time
import requests
import os
import subprocess
from random import randint
import shelve
import sys
from cred import *

db = shelve.open("cache.db")
# downDir=os.getcwd()+"/tmp/"
downDir="/tmp/"

def getBrowser():
    chrome_options = webdriver.ChromeOptions()
    chromeBin=os.environ.get("GOOGLE_CHROME_BIN")
    if chromeBin is not None:
        chrome_options.binary_location = chromeBin
    chrome_options.add_argument('--no-sandbox')
    chrome_options.add_argument('--window-size=1420,1080')
    chrome_options.add_argument('--headless')
    chrome_options.add_argument('--disable-gpu')
    # for heroku
    chrome_options.add_argument('--disable-dev-shm-usage')   

    prefs = {'download.default_directory' : downDir}
    chrome_options.add_argument("download.default_directory="+downDir)
    chrome_options.add_experimental_option('prefs', prefs)

    chromedriverPath=os.environ.get("CHROMEDRIVER_PATH")
    if chromedriverPath is not None:
        driver = webdriver.Chrome(executable_path=os.environ.get("CHROMEDRIVER_PATH"), chrome_options=chrome_options)
    else:
        driver = webdriver.Chrome(chrome_options=chrome_options)

    return driver

class TransferData:
    def __init__(self, access_token):
        self.access_token = access_token

    def upload_file(self, file_from, file_to):
        dbx = dropbox.Dropbox(self.access_token)

        with open(file_from, 'rb') as f:
            dbx.files_upload(f.read(), file_to)

        return dbx.sharing_create_shared_link_with_settings(file_to).url.replace("dl=0","dl=1")

def upload4(imgPath,name="TMP"):
    transferData = TransferData(dropbox_token)

    file_from = imgPath
    file_to = '/Apps/Test-Vokurs2/'+name+str(uuid.uuid4())+".png"

    url= transferData.upload_file(file_from, file_to)
    # print(url)
    return url

def pdfToPng(pdfPath):
    imgPath2=pdfPath.replace(".pdf","")
    imgPath3=pdfPath.replace(".pdf","-*")
    imgPath=pdfPath.replace(".pdf",".png")
    subprocess.call(["pdftoppm", "-png",pdfPath,imgPath2])
    subprocess.call(["convert", "+append",imgPath3,imgPath])
    # subprocess.call(["rm", imgPath3])
    return imgPath

def addPdf(pdf,boardId,uploadTime):
    if pdf in db:
        imgUrl=db[pdf]
    else:
        imgPath=pdfToPng(pdf)
        imgUrl=upload4(imgPath)
        db[pdf]=imgUrl
    addImageUrl(imgUrl,boardId,uploadTime)

def addImageUrl(imgUrl,boardId, uploadTime):
    url=boardId

    driver=getBrowser()

    driver.get(url)

    time.sleep(10)

    driver.find_element_by_class_name("AT__toolbar--LIBRARY").click()
    time.sleep(0.5)
    driver.find_element_by_class_name("AT__library--UPLOAD").click()
    time.sleep(0.5)

    driver.find_element_by_xpath("//*[@data-autotest-id='AT__upload--upload_via_url']").click()

    driver.find_element_by_xpath("//*[@data-autotest-id='modal-window__input']").send_keys(imgUrl)
    driver.find_element_by_xpath("//*[@data-autotest-id='modal-window__submit-button']").click()

    time.sleep(uploadTime)
    try:
        driver.close()
    except:
        pass


def uploadPdf(sheetPdf,boardId,uploadTime=20):
    addPdf(sheetPdf,boardId,uploadTime)
    return boardId



board=sys.argv[1]
pdf=sys.argv[2]
boardUrl=f"https://miro.com/app/board/{board}/"

uploadPdf(pdf,boardUrl)