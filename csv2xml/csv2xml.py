#!/usr/bin/python3

import csv
import xml.etree.ElementTree as ET

#========================================================
# References:
# - https://www.pythonmorsels.com/csv-reading/
# - https://stackoverflow.com/questions/3605680/creating-a-simple-xml-file-using-python
#========================================================

def convert(csvfile, xmlfile):
    print("CSV:" + csvfile)
    print("XML:" + xmlfile)

    # Read the CSV into a dictionary.
    file = open(csvfile)
    reader = csv.DictReader(file)

    #for row in reader:
    #    print(row)
    #    print(row['description'])

    # Start creating the XML data.
    root = ET.Element("root")
 
    for row in reader:
        doc = ET.SubElement(root, "location")
        keys = list(row.keys())

        print(row)

        for key in keys:
            print("key=" + key + " val=" + row[key])
            ET.SubElement(doc, key).text = row[key]
    
    # Write the XML to file.
    tree = ET.ElementTree(root)
    #ET.indent(tree, space='  ')
    tree.write(xmlfile)

#========================================================

if __name__ == "__main__":
    CSVFILE = "../CSV/DragonsApron.csv"
    XMLFILE = "../XML/DragonsApron.xml"

    convert(CSVFILE, XMLFILE)

#========================================================

