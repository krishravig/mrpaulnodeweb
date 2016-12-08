import os
import sys
import pickle
from textblob import TextBlob
import numpy as np
import pandas as pd
from openpyxl import load_workbook
import warnings
warnings.filterwarnings("ignore")

faq = pd.read_excel(open('/Users/ravkrishnan/krakenapp/scripts/FAQ_questions_Dump.xlsx', 'rb'), sheetname='Export Worksheet')

def split_into_lemmas(comment):
    words = TextBlob(comment).words
    # for each word, take its "base form" = lemma
    return [word.lemma for word in words]

def tfidf_trans(bow_transformer, tfidf_transformer, comments):
    comment_bow = bow_transformer.transform(comments)
    comment_tfidf = tfidf_transformer.transform(comment_bow)
    return comment_tfidf

with open('/Users/ravkrishnan/krakenapp/scripts/comment_classifier.pkl', 'rb') as f:
    bow_transformer, tfidf_transformer, cl = pickle.load(f)

#comment = 'Did not receive my TV.'
comment = str(sys.argv[1])

ind = None
if sum(faq['TITLE'].str.contains(comment, case=False)) > 0:
    ind = np.where([faq['TITLE'].str.contains(comment, case=False)])[1][0]

if ind is not None:
    print(faq['CONTENT'][ind])
else:
    print(cl.predict(tfidf_trans(bow_transformer, tfidf_transformer, [comment]))[0])
