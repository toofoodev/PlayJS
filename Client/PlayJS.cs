namespace PlayJS
{
    using System;
    using System.Collections;
    using UnityEngine;
    using UnityEngine.Networking;

    public class PlayJS : MonoBehaviour
    {
        public string ServerUrl = "http://localhost:3000";
        private string currentcosId;

        public static PlayJS Instance { get; private set; }

        private void Awake()
        {
            Instance = this;
        }

        public void BuyCosmetic(string pid, string cos)
        {
            currentcosId = cos;
            StartCoroutine(SendReq(pid, "Cosmetic"));
        }

        private IEnumerator SendReq(string playerId, string what)
        {
            if (what == "Cosmetic")
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
        }
    }
}