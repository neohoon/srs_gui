# GUI for Smart Rader System

## System Description
   Refer to System Description pdf file, "SRS GUI System Description V0.1 181231.pdf"
   
## How to Make Distribution Package on Windows, Linux, or OSX.

### Prerequisites
* In order to make executable on Windows, Linux, or OSX, Python interpreter and appropriate Python packages are needed.
* Anaconda3 4.4.0, open source distribution of Python 3.6, is strongly recommended.  
* Install anaconda of Python 3.6.  
  Download "Anaconda3-4.4.0" in https://repo.anaconda.com/archive/ and execute it.  
* Install following Python package(s) for SRS_GUI.
  - pyserial  
  - pyinstaller 
  - Run the following command on conda console.  
    $ conda install -c anaconda pyserial  
      Refer to https://anaconda.org/anaconda/pyserial  
    $ conda install -c conda-forge pyinstaller.  
      Refer to https://anaconda.org/conda-forge/pyinstaller  
### Make Executable
* Run following commands in the SRS_GUI root folder.  
  $ pyinstaller --onefile srs_gui.py
### Zip necessary files and folders.
* copy dist/srs_gui.exe to SRS_GUI root folder.
* zip srs_gui.exe, srs_gui.thml, js folder, and css folder.
* You can distribute zip file to any customer.
### Notice
* SRS_GUI operation was confirmed on OSX.
* SRS_GUI operation was confirmed on Windows 10. But... ^^
