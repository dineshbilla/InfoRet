#!/usr/bin/python

from bs4 import BeautifulSoup
from time import sleep,time
import urllib
import re

seed_pages = ['/wiki/List_of_Nobel_laureates','/wiki/Academy_Awards']
prefix = 'https://en.wikipedia.org'
visited = set(seed_pages)

#Ignores images, files, references within the same page and special sections
def extension_scan(url):
	file_ext = ['.png','.jpg','.jpeg','.gif','.tif','.txt','.pdf','.svg',':','#']
	for ext in file_ext:
		if ext in url:
			return True
	return False

def main_crawl():

	wiki_regex = re.compile('/wiki/')
	myfile = open('wiki.txt', 'w') #output file containing links
	crawl_start = time()
	index = 0
	start_time = time()
	#for seed in visited:
	while len(visited) < 100000:
		
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
				#if link['href'] in visited:
					#print link['href']
				if link['href'] not in visited:#else:
					myfile.write(link['href']+'\n')
					visited.add(link['href'])
					seed_pages.append(link['href'])
					if len(visited) % 2000 == 0:
						end_time = time()
						print "Sites crawled: "+str(len(visited))+" time taken = "+str(end_time-start_time)
						print " Sleeping for 3 seconds"
						start_time = end_time
						sleep(3)


	myfile.close()
	crawl_end = time()
	print "Total time taken: "+str(crawl_end-crawl_start)

def download():
	myfile = open('wiki.txt', 'r') #output file containing links
        outfile = open('dump.txt','w') # output file dump in XML
	for line in myfile:
		sleep(1)
                link = line.replace('/wiki','/wiki/Special:Export')
		link = prefix+line
		r = urllib.urlopen(link).read()
		outfile.write(r)
	outfile.close()
	myfile.close()


main_crawl()
#download()


