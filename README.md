# mitie-trainer

An interactive, browser-based model training tool for
[MITIE](https://github.com/mit-nlp/MITIE). The MIT Information Extraction tool
provides fast and easily trained named entity recognition (NER) and binary relation
extraction abilities and is free for both noncommercial and commercial use.
This package is a browser-based wrapper on the training tool, allowing for
faster tagging of training data for input into MITIE.


### Setup

- If it's not already present, install Tangelo, a Python framework used to
  communicate between the browser and the backend. You can `pip install
  tangelo` or [read the Tangelo
  docs](http://tangelo.readthedocs.org/en/v0.8/installation.html) for more
  details. 
- Download the MITIE models:
  [MITIE-models-v0.2.tar.bz2](http://sourceforge.net/projects/mitie/files/binaries/MITIE-models-v0.2.tar.bz2)
- Extract the models:  `tar -xjf MITIE-models-v0.2.tar.bz2`
- Move the **MITIE-models/english/total_word_feature_extractor.dat** to
  **html/data/models/**

### Data

You should structure your training data in a tab-separated file (in the form
`ID\tTEXT_BODY` for each row). Run this TSV through the formatting script in
/src/ to convert it into the JSON that the trainer expects. If your TSV of ids
and stories were called `output.tsv` and were located in the mitie-trainer
directory, make the JSON like this:

`cat output.tsv | ./src/sample_format.py > sample.json`

Then place the **sample.json** file at **html/data/trainings/sample/**

Start Tangelo with **html/** as the root directory from the command line:

`tangelo start --root /path/to/mitie-trainer/html`

Navigate to where Tangelo is running in your browser (the default is 0.0.0.0:8080) and
begin using the trainer.

The model can be trained either from the browser, or the tagged training data
can be exported as a JSON and added to the model using the [Python
bindings](https://github.com/mit-nlp/MITIE/blob/master/examples/python/train_ner.py)
that came with MITIE.

