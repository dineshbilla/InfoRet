#!/usr/bin/python

from bs4 import BeautifulSoup
import urllib
import re

seed_pages = ['/wiki/List_of_Nobel_laureates','/wiki/Academy_Awards']
prefix = 'https://en.wikipedia.org'
visited = set(seed_pages)

#Check for file type in URL so crawler does not crawl images and text files
def extension_scan(url):
	file_ext = ['.png','.jpg','.jpeg','.gif','.tif','.txt','.pdf','.svg']
	for ext in file_ext:
		if ext in url:
			return True
	return False

def main_crawl():

	wiki_regex = re.compile('/wiki/')
	myfile = open('wiki.txt', 'w') #output file containing links

	index = 0
	#for seed in visited:
	while len(visited) < 5000:
		#if len(visited) > 5000:
			#break
		seed = seed_pages[index]
		index = index+1
		
		wiki_url = prefix+seed
		r = urllib.urlopen(wiki_url).read()

		soup = BeautifulSoup(r,"lxml")
		content =  soup.find("div",{"id": "mw-content-text","class":"mw-content-ltr"})
		links = content.find_all("a",href=True)

		for link in links:
			if wiki_regex.match(link['href']) and extension_scan(link['href']) == False:
				#print link['href']
				if link['href'] in visited:
					print link['href']
				else:
					myfile.write(link['href']+'\n')
					visited.add(link['href'])
					seed_pages.append(link['href'])



main_crawl()


