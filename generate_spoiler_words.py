import nltk
from nltk.corpus import stopwords
from nltk.tokenize import word_tokenize
from nltk.stem import WordNetLemmatizer
from sklearn.feature_extraction.text import TfidfVectorizer
import spacy
import requests
from bs4 import BeautifulSoup
from collections import Counter

nltk.download('punkt')
nltk.download('stopwords')
nltk.download('wordnet')

stop_words = set(stopwords.words('english'))
lemmatizer = WordNetLemmatizer()
nlp = spacy.load("en_core_web_sm")

#makes lowercase, gets rid of punctuation, and makes words in base form
def preprocess_text(text):
    words = word_tokenize(text.lower()) 
    useful_words = []
    for word in words:
        if word.isalpha() and word not in stop_words:
            useful_words.append(word)
    useful_words = [lemmatizer.lemmatize(word) for word in useful_words]
    return " ".join(useful_words)

#uses tf-idf word importancy stuff
def extract_keywords_tfidf(text, num_keywords = 10):
    tfidf = TfidfVectorizer(stop_words = "english", max_features= num_keywords)
    tfidf_matrix = tfidf.fit_transform([text])  # Transform the text into TF-IDF matrix
    words = tfidf.get_feature_names_out()  # Get the words
    scores = tfidf_matrix.toarray().flatten()  # Get the corresponding TF-IDF scores

    #Sort by score
    word_scores = sorted(zip(words, scores), key = lambda x: x[1], reverse = True)

    # Return top words
    result = []
    for i in range(num_keywords):
        word, score = word_scores[i]
        result.append(word)
    return result

#NER Name Entity Recognition
def extract_named_entities(text):
    doc = nlp(text) 
    return [ent.text for ent in doc.ents]  # Return a list of named entities



#better generate keywords
def generate_keywords(show_name):
    show_name_formatted = show_name.replace(" ", "_")
    #just an example for where to try to gather all spoiler related words, can use other websites
    url = f"https://en.wikipedia.org/wiki/{show_name_formatted}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        content = soup.find("div", {"id": "bodyContent"}).get_text()

        processed_text = preprocess_text(content)
        #keywords can be changed to see which one is more optimal
        num_keywords = 10
        tfidf_keywords = extract_keywords_tfidf(processed_text, num_keywords)
        
        named_entities = extract_named_entities(content)
        
        keywords = list(set(tfidf_keywords + named_entities))
        return keywords


    except Exception:
        print(f"Error fetching keywords for {show_name}: {e}")
        return []