# JPTextToAnki

A console app I wrote to aid in my study of japanese. It automatically generates anki decks based on a japanese text. For example, if you have a song that you enjoy but don't really understand you can use the app to make a deck with all the words from the song. Then, once you have learned all the cards, you will (hopefully) understand the whole song. 

The app takes text as input, extracts words from it, and creates an anki card for each of them. The word definitions are fetched from [jisho](https://jisho.org/). You can either choose to use `tiny-segmenter` or `nagisa` as the text segmentation engine. `nagisa` tends to produce fewer garbage cards and generally do a better job, but it is also harder to set up.

# Running the app with tiny-segmenter

First, you need to download the repo and install the required node modules. I'm running Windows 11 and Node v16.15.1. Other node versions should work as well.

```
git clone https://github.com/Equbuxu/JPTextToAnki.git
cd .\JPTextToAnki\
npm install
```

Then, put a .txt file with your text into `files/inputs`. Then, open `files/config.json` and find the line that says:

```
"input":"files/inputs/Omoi-Teo.txt"
```

Change `Omoi-Teo.txt` to the name of your file. Also, change `input-type` to `text-tiny-segmenter` since we don't want to bother with setting up Nagisa just yet. Now build the app and run it:

```
npx tsc
node build/index.js
```

You should end up with two files int `files/output`: `output-kanji.txt` and `output-words.txt`.

# Importing cards into Anki

First, you'll need to create a new card type for the generated cards. Go into Tools -> Manage Note Types -> Add -> Add: Basic -> OK. Select the newly created type and click `Cards`. There, choose `Styling` and replace the default styles with these:

```css
.card {
 font-size: 24pt;
 text-align: left;
 color: black;
 background-color: #FFFAF0;
 font-family: yuumichou;
 line-height: 1.2em;
}

.weak {
 font-size: 16pt;
 color: gray;
 display:block;
 margin-top: 10px;
 line-height: 0.9;
}

.inline-weak {
 font-size: 16pt;
 color: gray;
}

.card-front {
 font-weight: bold;
 font-size: 35pt;
}

.title {
 font-weight: bold;
 margin-top: 5px; 
 margin-left: 30px;
 height: 35px
}

.info {
 font-size: 16pt;
}
```

This only needs to be done once, and now you will be able to import the file generated by the app.

Press `Import File` on the main anki screen and choose the generated `output-words.txt`. Choose the previously created card type instead of Basic. Pick a deck for the cards or create a new one. Make sure `Allow HTML in fields` is ticked. Press `Import`. That's it!

# Using Nagisa

`Nagisa` is a library for text segmentation. It's a python library, but the rest of the project is written in typescript. Because of that I'm using `Nagisa` in a small python server that provides a text segmentation api. You'll need to run that server alongside the main app. First, install python 3.8 if you don't already have it. Then, from the project root do:

```
cd split-words-server
py -3.8 -m pip install nagisa
py -3.8 split-words.py
```

This will launch the server on `localhost:8000`. After that you can follow the instructions from `Running the app with tiny-segmenter`, but change `input-type` to `text-nagisa` in the config file.