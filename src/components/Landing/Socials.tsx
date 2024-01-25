import { FaDiscord, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa'

const socials = [
  {
    Icon: FaTwitter,
    href: 'https://twitter.com/ProtocolLand'
  },
  {
    Icon: FaDiscord,
    href: 'https://discord.com/invite/GqxX2vtwRj'
  },
  {
    Icon: FaLinkedin,
    href: 'https://www.linkedin.com/company/protocol-land/'
  },
  {
    Icon: FaGithub,
    href: 'https://github.com/labscommunity/protocol-land'
  }
]

export default function Socials() {
  return (
    <div className="flex gap-4">
      {socials.map((social, index) => {
        return (
          <a
            href={social.href}
            id={`social-${index}`}
            className="flex h-10 w-10 bg-gray-100 hover:bg-gray-300 items-center justify-center rounded-full"
            target="_blank"
          >
            <social.Icon className="w-6 h-6" />
          </a>
        )
      })}
    </div>
  )
}
