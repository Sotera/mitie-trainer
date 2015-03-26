# mitie-trainer

An interactive, browser-based model training tool for
[MITIE](https://github.com/mitll/MITIE). The MIT Information Extraction tool
provides fast and easily trained named entity recognition (NER) and binary relation
extraction abilities and is free for both noncommercial and commercial use.
This package is a browser-based wrapper on the training tool, allowing for
faster tagging of training data for input into MITIE.


### Setup

- If it's not already present, install Tangelo v0.6.1 `pip install -Iv tangelo==0.6.1`
- If not present install config `pip install config` 
- Install [MITIE](https://github.com/mitll/MITIE)
- Set the path to your MITIE home in **conf/app.cfg**

### Data

You should structure your training data in a tab-separated file (in the form`ID\tTEXT_BODY` for each row). Run this TSV through the formatting script in **tools/** to convert it into the JSON that the trainer expects. If your TSV of ids and stories were called `output.tsv` and were located in the **mitie-trainer** directory, make the JSON like this:

`cat output.tsv | ./tools/create_trainings.py > sample.json`

You may now upload the **sample.json** file do the application

Start Tangelo with **html/** as the root directory from the command line:

`tangelo start --root /path/to/mitie-trainer/html`

Navigate to where Tangelo is running in your browser (the default is 0.0.0.0:8080)




