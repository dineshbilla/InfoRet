#!/usr/bin/python
from bs4 import BeautifulSoup
import urllib
from time import sleep,time
import re

prefix = 'https://en.wikipedia.org'

def stripper(filepath):

	infile = open(filepath,'r')
	content = infile.read()
	infile.close()
	content = re.sub(re.compile('(&lt;.*?&gt;)|({{.*?}})|(==+.*?===*)|(\[\[(.+):.*?\]\])|(\[http:.*?\])',re.MULTILINE),'',content)
	content = re.sub(r'\[\[Category:(.*)?\]\]',r"<category>\1</category>",content)
	content = re.sub(re.compile('{+.*?}+',re.MULTILINE|re.DOTALL),'',content)
	content = re.sub(re.compile("\(+|\)+|''+|\[+|\]+",re.MULTILINE),'',content)
	content = re.sub(re.compile('\n+',re.MULTILINE),'\n',content)
	content = content.replace('|','')
	content = re.sub(r'<text(.*)>',"<text>",content)
	content = re.sub(r'<\/text>',"\n<text>",content)

	outfile = open(filepath,'w')
	outfile.write(content)
	outfile.close()
	infile.close()


def download():
	myfile = open('wiki.txt', 'r') #output file containing links
        
	for line in myfile:
		sleep(1)
		link = prefix+line.replace('/wiki','/wiki/Special:Export')
		r = urllib.urlopen(link).read()
	 	soup = BeautifulSoup(r,"xml")
		print soup.title.string
		filepath = 'Dump/'+soup.title.string
		outfile = open(filepath,'w') # output file dump in XML
		outfile.write(soup.title.encode('utf-8')+'\n')
		outfile.write(soup.find("id").encode('utf-8')+'\n')
		outfile.write(soup.find("text").encode('utf-8'))
		outfile.close()
		stripper(filepath)
		print link
	
	myfile.close()

download()
