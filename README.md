# mitie-trainer

Model Training tool for [MITIE](https://github.com/mitll/MITIE)


### Setup

- Download [MITIE-models-v0.2.tar.bz2](http://sourceforge.net/projects/mitie/files/binaries/MITIE-models-v0.2.tar.bz2)
- extract `tar -xjf MITIE-models-v0.2.tar.bz2`
- move the **MITIE-models/english/total_word_feature_extractor.dat** to **html/data/models/**


### Data

Create your own training sample

You can create your own training samples by running a tsv file through
the **src/sample_format.py**

By default the script expects the format of **ID\tTEXT_BODY** for each
row. 

Run the script like below 

`cat output.tsv | ./src/sample_format.py > sample.json`

Place your **sample.json** file at **html/data/trainings/sample/**

Start tangelo with **html/** as the root directory





