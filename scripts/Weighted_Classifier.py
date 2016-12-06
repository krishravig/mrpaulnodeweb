
# coding: utf-8

# In[10]:

import sys
import pickle
from textblob import TextBlob


# In[11]:

def split_into_lemmas(comment):
    words = TextBlob(comment).words
    # for each word, take its "base form" = lemma 
    return [word.lemma for word in words]


# In[12]:

def tfidf_trans(bow_transformer, tfidf_transformer, comments):
    comment_bow = bow_transformer.transform(comments)
    comment_tfidf = tfidf_transformer.transform(comment_bow)
    return comment_tfidf


# In[13]:

with open('/Users/ravkrishnan/krakenapp/scripts/comment_classifier.pkl', 'rb') as f:
    bow_transformer, tfidf_transformer, cl = pickle.load(f)


# In[14]:

#comment = 'Did not receive my TV.'
comment = str(sys.argv)[1]


# In[15]:

print(cl.predict(tfidf_trans(bow_transformer, tfidf_transformer, [comment]))[0])

