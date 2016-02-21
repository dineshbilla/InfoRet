#!/usr/bin/python
from bs4 import BeautifulSoup
import urllib
from time import sleep,time
import re
import sys

prefix = 'https://en.wikipedia.org'

def stripper(filepath):

	infile = open(filepath,'r')
	content = infile.read()
	infile.close()
	#dont change the order 
	content = re.sub(re.compile('(<!--.*?-->)|(&lt;.*?&gt;)',re.MULTILINE|re.DOTALL),'',content)
	content = re.sub(re.compile("{{.*?'''",re.MULTILINE|re.DOTALL),'',content)
	content = re.sub(r'\[\[Category:(.*)?\]\]',r"<category>\1</category>",content)
	content = re.sub(r'<\/category> *\n<category>',',',content)
	content = re.sub(re.compile('(&lt;.*?&gt;)|({{.*?}})|(==+.*?===*)|(\[\[(.+):.*?\]\])|(\[http:.*?\])',re.MULTILINE),'',content)

	content = re.sub(re.compile('{+.*?}+',re.MULTILINE|re.DOTALL),'',content)
	content = re.sub(re.compile("\(+|\)+|''+|\[+|\]+",re.MULTILINE),'',content)
	content = re.sub(re.compile('\n+',re.MULTILINE),'\n',content)
	content = content.replace('|','')
	content = re.sub(r'<text(.*)>',"<text>",content)
	content = re.sub(r'<\/text>',"\n</text>",content)

	outfile = open(filepath,'w')
	outfile.write(content)
	outfile.close()
	infile.close()


def download():
	myfile = open('wiki.txt', 'r') #output file containing links
	#excepfile = open('Exceptions.txt', 'w')
	ix = 0
	for line in myfile:
		if ix%5 == 0: sleep(1)
		ix = ix+1
		try:
			link = prefix+line.replace('/wiki','/wiki/Special:Export')
			r = urllib.urlopen(link).read()
		 	soup = BeautifulSoup(r,"xml")
			print soup.title.string
			filepath = 'Dump/'+soup.title.string
			outfile = open(filepath,'w') # output file dump in XML
			outfile.write('<?xml version="1.0"?>\n<solrwiki>\n<page>\n')
			outfile.write(soup.title.encode('utf-8')+'\n')
			outfile.write(soup.find("id").encode('utf-8')+'\n')
			outfile.write(soup.find("text").encode('utf-8'))
			outfile.write('\n</page>\n</solrwiki>')
			outfile.close()
			stripper(filepath)
			#print link
		except Exception as e:
			print e
			
	
	myfile.close()
	#excepfile.close()

if __name__ == "__main__":
	download()
