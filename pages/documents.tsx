import Head from 'next/head'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { Heading } from '../components/heading'
import { PageShell, PageSurface } from '../components/page-shell'
import { Text } from '../components/text'
import Spinner from '../components/ui/Spinner'

const base64toBlob = (base64Data: string) => {
  const sliceSize = 1024
  const byteCharacters = atob(base64Data)
  const bytesLength = byteCharacters.length
  const slicesCount = Math.ceil(bytesLength / sliceSize)
  const byteArrays = new Array(slicesCount)

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize
    const end = Math.min(begin + sliceSize, bytesLength)

    const bytes = new Array(end - begin)
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0)
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes)
  }
  return new Blob(byteArrays, { type: 'application/pdf' })
}

const openBase64NewTab = (base64Pdf: string): void => {
  let blob = base64toBlob(base64Pdf)
  console.log('Blob size:', blob.size)

  function isiPhone(): boolean {
    return /iPhone|iPod/.test(navigator.userAgent) && !hasMSStream(window)
  }

  // Type guard for navigator
  function hasMsSaveOrOpenBlob(
    navigator: Navigator
  ): navigator is Navigator & { msSaveOrOpenBlob: (blob: Blob, defaultName?: string) => boolean } {
    return 'msSaveOrOpenBlob' in navigator
  }

  function hasMSStream(window: Window): window is Window & { MSStream: any } {
    return 'MSStream' in window
  }

  // Check if the window and navigator are available
  if (typeof window !== 'undefined') {
    if (hasMsSaveOrOpenBlob(window.navigator)) {
      // For IE and Edge
      window.navigator.msSaveOrOpenBlob(blob, 'document.pdf')
    } else {
      const blobUrl = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = blobUrl

      if (isiPhone()) {
        anchor.target = '_self' // Open in the current tab for iPhone
      } else {
        anchor.target = '_blank' // Open in a new tab for other devices
      }

      // Add the anchor to the document body
      document.body.appendChild(anchor)

      // Trigger a click event on the anchor
      anchor.click()

      // Remove the anchor from the document body
      document.body.removeChild(anchor)

      // Clean up the object URL after some time
      setTimeout(() => URL.revokeObjectURL(blobUrl), 1000)
    }
  }
}

const parseName = (name: string): string => {
  return new DOMParser().parseFromString(name, 'text/html').documentElement.textContent
}

interface DocumentsProps {
  client: any
  createError: (message: string) => void
}

export default function Documents({ client, createError }: DocumentsProps) {
  const router = useRouter()
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      //console.log("DEATTHHHHH FUCK")
      console.log(documents)
      if (client.loadedDocuments == undefined) {
        client
          .documents()
          .then(([res]) => {
            console.log(res)
            res.forEach((doc) => {
              doc.file.comment = parseName(doc.file.comment)
              doc.file.type = parseName(doc.file.type)
            })
            setDocuments(res)
            client.loadedDocuments = res
            setLoading(false)
          })
          .catch((error) => {
            createError(error.message)
          })
      } else {
        setDocuments(client.loadedDocuments)
        setLoading(false)
      }
    } catch {
      if (localStorage.getItem('remember') === 'false') {
        console.log('womp womp')
      }
    }
  }, [client])

  return (
    <PageShell>
      <Head>
        <title>Documents - Grade Melon</title>
      </Head>
      {loading ? (
        <div className="flex justify-center">
          <Spinner size="xl" color="pink" />
        </div>
      ) : (
        <PageSurface>
          <Heading level={1} className="mb-2">
            Documents
          </Heading>
          <Text className="mb-6">Recent report cards, transcripts, and other files pulled from StudentVue.</Text>
          <div className="overflow-x-auto">
            <table className="text-left text-sm text-gray-500 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-700 dark:text-gray-400">
                <tr>
                  <th scope="col" className="py-3 pl-6">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Document
                  </th>
                  <th scope="col" className="px-6 py-3">
                    Category
                  </th>
                </tr>
              </thead>
              <tbody>
                {documents &&
                  documents.map((document, i) => (
                    <tr
                      className={`bg-${i % 2 == 0 ? 'white' : 'gray-50'} border-b dark:bg-gray-${
                        i % 2 == 0 ? 900 : 800
                      } dark:border-gray-700`}
                      key={i}
                    >
                      <th scope="row" className="whitespace-nowrap py-4 pl-6 font-medium text-gray-900 dark:text-white">
                        {document.file.date.toLocaleDateString()}
                      </th>
                      <td className="px-6 py-4">
                        <a
                          onClick={async () => {
                            let download = await document.get()
                            console.log(download)
                            openBase64NewTab(download[0].base64)
                          }}
                          href="#"
                        >
                          {document.comment}
                        </a>
                      </td>
                      <td className="px-6 py-4">{document.file.type}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </PageSurface>
      )}
    </PageShell>
  )
}
