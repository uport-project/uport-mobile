from os import getcwd, chdir
import glob
import os

def select_element(driverinfo, elem):
    
        return driverinfo.find_element_by_id(elem)



def find_uportapp():
        folder = 'uPortMobile-*'
        current_dir =  os.path.abspath(os.path.dirname(__file__))
        direct = os.path.join(os.path.abspath(current_dir + "/../../../"),"Library", "Developer", "Xcode", "DerivedData")    
        saved = getcwd()
        chdir(direct)
        it = glob.glob(folder)
        chdir(saved)
        return (" ".join(it))


    

