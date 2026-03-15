import pandas as pd
import requests
import time


def verify_songs(file_name):
    df = pd.read_csv(f"{file_name}.csv")

    # create column if it doesn't exist
    if "search_query" not in df.columns:
        df["search_query"] = ""

    for idx, row in df.iterrows():
        query = f'artist:"{row["artist"]}" track:"{row["name"]}"'
        url = "https://api.deezer.com/search"
        
        r = requests.get(url, params={"q": query})
        data = r.json()

        if data["total"] > 0:
            result = data["data"][0]
            artist_name = result["artist"]["name"]
            title = result["title"]

            # write search_query into dataframe
            search_query = f"{artist_name} {title}"
            df.at[idx, "search_query"] = search_query

        time.sleep(0.2)  # avoid rate limits
        df.to_csv(f"{file_name}.csv", index=False)



if __name__ == "__main__":
    verify_songs(r"server\songs\HebrewHits")
    print("Finished")