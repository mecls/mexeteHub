import localFont from 'next/font/local'

export const inter = localFont({
  src: './Inter_18pt-Regular.ttf',
  display: 'swap',
  variable: '--font-inter',
})

export const interBold = localFont({
  src: './Inter_18pt-Bold.ttf',
  display: 'swap',
  variable: '--font-inter-bold',
})

export const interMedium = localFont({
  src: './Inter_18pt-Medium.ttf',
  display: 'swap',
  variable: '--font-inter-medium',
})

export const interSemiBold = localFont({
  src: './Inter_18pt-SemiBold.ttf',
  display: 'swap',
  variable: '--font-inter-semi-bold',
})

export const interLight = localFont({
  src: './Inter_18pt-Light.ttf',
  display: 'swap',
  variable: '--font-inter-light',
})
