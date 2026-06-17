namespace PlayJS
{
    using System;
    using System.Collections;
    using UnityEngine;
    using TMPro;
    using UnityEngine.Networking;

    public class PlayJS : MonoBehaviour
    {
        public string ServerUrl = "http://localhost:3000";

        public static PlayJS Instance { get; private set; }

        private void Awake()
        {
            Instance = this;
        }

        public void BuyCosmetic(string pid, string cos)
        {
            StartCoroutine(cosmeticreq(pid, cos));
        }

        public void EditPlayer(string pid, string changeWhat, string changeToWhat)
        {
            StartCoroutine(editreq(pid, changeWhat, changeToWhat));
        }

        private IEnumerator editreq(string playerId, string what, string how)
        {
            using (UnityWebRequest webRequest = UnityWebRequest.Get(ServerUrl + "/user/edit/" + what))
            {
                webRequest.SetRequestHeader("player", playerId);
                webRequest.SetRequestHeader("what", how);

                yield return webRequest.SendWebRequest();

                if (webRequest.responseCode == 200)
                {
                    Debug.Log("changed " + what);
                }
                else
                {
                    Debug.Log("cant changed name" + what);
                }
            }
        }

        private IEnumerator cosmeticreq(string playerId, string currentcosId)
        {
            using (UnityWebRequest webRequest = UnityWebRequest.Get(ServerUrl + "/cosmetic/buy/"))
            {
                webRequest.SetRequestHeader("player", playerId);
                webRequest.SetRequestHeader("cosmetic", currentcosId);

                yield return webRequest.SendWebRequest();

                if (webRequest.responseCode == 200)
                {
                    Debug.Log("[PlayJS.Manager] Bought Cosmetic.");
                }
                else
                {
                    if (webRequest.responseCode == 401)
                    {
                        Debug.Log("[PlayJS.Manager] Couldn't Buy Cosmetic! (jumble jumble)");
                    }
                    else
                    {
                        Debug.Log("[PlayJS.Manager] Couldn't Buy Cosmetic!");
                    }
                }
            }
        }

        public IEnumerator GetDataValue(string id, System.Action<string> onComplete)
        {
            string fullUrl = PlayJS.Instance.ServerUrl + "/server/data/" + id;

            using (UnityWebRequest webRequest = UnityWebRequest.Get(fullUrl))
            {
                yield return webRequest.SendWebRequest();

                if (webRequest.result == UnityWebRequest.Result.Success)
                {
                    string sting = webRequest.downloadHandler.text;
                    onComplete?.Invoke(sting);
                }
                else
                {
                    Debug.LogError($"[PlayJS] Failed to get! ({webRequest.responseCode}): {webRequest.error}");
                    onComplete?.Invoke(null);
                }
            }
        }
    }
}