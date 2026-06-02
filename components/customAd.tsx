import Cookies from 'js-cookie'
import { useEffect, useRef } from 'react'
import { useInView } from '../hooks/isVisible'

/*


if i wanted to be cheeky and fast, i could get the images of the ads and their names as getStaticProps (use revalidate so it updates every hour) so that only the quick textual data needs be fetched
from the ads server at load time, is that worthwhile? the cost is that advertisers seeking to upload their ads wouldn't see them on demand

orrrrrr, if i wanted to be reallly cheek, i could have it so that I don't go for exact perfect $5 cpm, and instead, just get the ads and all the metadata with 
getStaticProps once an hour or so, that way, 0 fetches need to occur to load the ad for the user...


*/

const adServer = 'https://adverts.grademelon.org'

interface props {
  ad: any
  timestamp: number
  setAd: (ad: any) => void
  setTime: (time: number) => void
}

export default function CustomAd({ ad, timestamp, setAd, setTime }: props) {
  const adRef = useRef(null)
  const visbility = useInView(adRef, { threshold: 0.4 })
  console.log('does it fukin have a brain')
  /*
    const [timestamp,setTime]=useState(0);
    const [ad,setAd]=useState(undefined);
    */

  function handleClick() {
    if (ad.url) {
      increment('click')
      window.open(ad?.url)
    }
  }
  //should i use oicd or just do sum custom auth tokens via the synergyProxy. validate credenetials. only send ads to logged in people. idk. i mean yeah i guess. why not.

  function increment(type) {
    const token = Cookies.get('token')
    fetch(adServer + '/increment', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ type: type, adId: ad.adId, advertiserId: ad.advertiserId, token: token }),
    }).catch((error) => console.log(error))
  }

  async function getAd() {
    if (localStorage.getItem('infoCache') != undefined) {
      var schoolName: string = JSON.parse(localStorage.getItem('infoCache')).info.currentSchool
    } else {
      var schoolName = 'default/ALL'
    }

    const response = await fetch(adServer + '/serve?school=' + encodeURIComponent(schoolName), {
      method: 'GET',
    })
    return await response.json()
  }

  useEffect(() => {
    if (ad == undefined) {
      getAd()
        .then((res) => {
          setAd(res.ad)
        })
        .catch((error) => console.log(error))
    }
  }, [])

  useEffect(() => {
    if (visbility && Date.now() - timestamp >= 1000 * 60 * 5) {
      increment('view')
      setTime(Date.now())
    } else {
      console.log(timestamp, visbility)
    }
  }, [visbility])

  return (
    <>
      {ad ? (
        <div className="mx-4 flex justify-center">
          <img ref={adRef} className="max-h-96 border-2" src={ad.image} onClick={handleClick} />
        </div>
      ) : (
        <></>
      )}
    </>
  )
}
