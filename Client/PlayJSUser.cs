namespace PlayJS.User
{
    using UnityEngine;
    using UnityEngine.Networking;
    using System.Collections;
    using System.Collections.Generic;

    public class PlayerInfo
    {
        public string id;
        public string name;
        public int currency;
        public List<string> cosmetics;
    }

    public class Response
    {
        public bool success;
        public string type;
    }

    public class PlayJSUser : MonoBehaviour
    {
        public static PlayJSUser Instance { get; private set; }

        private void Awake()
        {
            Instance = this;
        }

        public IEnumerator GetPlayer(string playerId, System.Action<PlayerInfo> onComplete)
        {
            string fullUrl = PlayJS.Instance.ServerUrl + "/user/find/" + playerId;

            using (UnityWebRequest webRequest = UnityWebRequest.Get(fullUrl))
            {
                yield return webRequest.SendWebRequest();

                if (webRequest.responseCode == 200)
                {
                    StartCoroutine(Login(playerId, (data) => { onComplete?.Invoke(data); }));
                }
                if (webRequest.responseCode == 400)
                {
                    StartCoroutine(Create(playerId, (data) => { onComplete?.Invoke(data); }));
                }
            }
        }

        public IEnumerator Login(string playerId, System.Action<PlayerInfo> onComplete)
        {
            string fullUrl = PlayJS.Instance.ServerUrl + "/user/get/" + playerId;

            using (UnityWebRequest webRequest = UnityWebRequest.Get(fullUrl))
            {
                yield return webRequest.SendWebRequest();

                if (webRequest.result == UnityWebRequest.Result.Success)
                {
                    Debug.Log("[PlayJS.User.Login] Logged In");

                    string jsonString = webRequest.downloadHandler.text;
                    PlayerInfo playerData = JsonUtility.FromJson<PlayerInfo>(jsonString);
                    onComplete?.Invoke(playerData);
                }
                else
                {
                    Debug.LogError($"[PlayJS.User.Login] Failed to login! ({webRequest.responseCode}): {webRequest.error}");
                    onComplete?.Invoke(null);
                }
            }
        }

        public IEnumerator Create(string id, System.Action<PlayerInfo> onComplete)
        {
            string fullUrl = PlayJS.Instance.ServerUrl + "/user/create/" + id;

            using (UnityWebRequest webRequest = UnityWebRequest.Get(fullUrl))
            {
                yield return webRequest.SendWebRequest();

                if (webRequest.result == UnityWebRequest.Result.Success)
                {
                    Debug.Log("[PlayJS.User.Create] Created!");

                    string jsonString = webRequest.downloadHandler.text;
                    PlayerInfo playerData = JsonUtility.FromJson<PlayerInfo>(jsonString);
                    onComplete?.Invoke(playerData);
                }
                else
                {
                    Debug.LogError($"[PlayJS.User.Create] Failed to create! ({webRequest.responseCode}): {webRequest.error}");
                    onComplete?.Invoke(null);
                }
            }
        }
    }
}