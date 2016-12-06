
# coding: utf-8

# In[1]:

#import os
import pickle
import sys
from textblob import TextBlob


# In[2]:

#os.chdir('C:/Users/sichuang/Documents/Hackathon/Code')


# In[3]:

def split_into_lemmas(comment):
    #comment = unicode(comment, 'utf8').lower()
    words = TextBlob(comment).words
    # for each word, take its "base form" = lemma
    return [word.lemma for word in words]


# In[4]:

def tfidf_trans(bow_transformer, tfidf_transformer, comments):
    comment_bow = bow_transformer.transform(comments)
    comment_tfidf = tfidf_transformer.transform(comment_bow)
    return comment_tfidf


# In[5]:

with open('/Users/ravkrishnan/krakenapp/scripts/comment_classifier.pkl', 'rb') as f:
    bow_transformer, tfidf_transformer, cl = pickle.load(f)


# In[6]:

comment = str(sys.argv)[1]
#comment = 'Did not receive my TV.'

# In[7]:

print(cl.predict(tfidf_trans(bow_transformer, tfidf_transformer, [comment]))[0])

