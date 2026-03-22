import pandas as pd
import requests
import time

DEEZER_URL = "https://api.deezer.com/search"
SLEEP_TIME = 0.2

def get_deezer_result(query):
    """
    Search Deezer API and return the first result's search query string.
    """
    try:
        response = requests.get(DEEZER_URL, params={"q": query})
        data = response.json()
        if data.get("total", 0) > 0:
            result = data["data"][0]
            return f"{result['artist']['name']} {result['title']}"
    except Exception:
        pass
    return None

def verify_songs(file_path):
    """
    Validates songs against Deezer API and saves a new filtered CSV.
    """
    df = pd.read_csv(f"{file_path}.csv")
    validated_data = []

    for _, row in df.iterrows():
        search_query = None
        is_hebrew = pd.notna(row.get("name_hebrew")) and str(row["name_hebrew"]).strip() != ""

        if is_hebrew:
            # Try Hebrew artist + Hebrew track
            q1 = f'artist:"{row["artist_hebrew"]}" track:"{row["name_hebrew"]}"'
            search_query = get_deezer_result(q1)
            
            # Try English artist + Hebrew track if first fails
            if not search_query:
                q2 = f'artist:"{row["artist_english"]}" track:"{row["name_hebrew"]}"'
                search_query = get_deezer_result(q2)
                
            name = row["name_hebrew"]
            artist = row["artist_hebrew"] if \
                pd.notna(row.get("artist_hebrew")) and str(row["artist_hebrew"]).strip() != "" else \
                row["artist_english"]

        else:
            # English song
            q3 = f'artist:"{row["artist_english"]}" track:"{row["name_english"]}"'
            search_query = get_deezer_result(q3)
            name = row["name_english"]
            artist = row["artist_english"]

        if search_query:
            validated_data.append({
                "name": name,
                "artist": artist,
                "year": row["year"],
                "search_query": search_query
            })

        time.sleep(SLEEP_TIME)

    # Create and save new dataframe
    new_df = pd.DataFrame(validated_data)
    new_df.to_csv(f"{file_path}_validated.csv", index=False)

if __name__ == "__main__":
    verify_songs(r"server\songs\mix")
    print("Finished")