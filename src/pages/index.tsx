import Image from 'next/image'
import { Inter } from 'next/font/google'
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faIconName } from '@fortawesome/free-brands-svg-icons'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1> Hello </h1>
    </main>
  )
}
