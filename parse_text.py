import requests
from bs4 import BeautifulSoup
from collections import Counter


def generate_keywords(show_name):
    show_name_formatted = show_name.replace(" ", "_")
    url = f"https://en.wikipedia.org/wiki/{show_name_formatted}"
    try:
        response = requests.get(url)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, "html.parser")

        content = soup.find("div", {"id": "bodyContent"}).get_text()

        words = re.findall(r'\b[A-Za-z]{4,}\b', content)  # Words with 4+ letters
        common_words = Counter(words).most_common(50)
        
        #can be changed later to be more dynamic
        useless_words = {"from", "this", "with", "that", "which", "such", "their", "have", "more", "also"}
        keywords = []
        for word, frequency in common_words:
            word_lower = word.lower()
            if word_lower not in useless_words:
                keywords.append(word)
        return keywords

    except Exception:
        print(f"Error fetching keywords for {show_name}: {e}")
        return []