import React from 'react'
import { Share as ShareRN } from 'lucide-react-native'
import { iconWithClassName } from './iconWithClassName'
iconWithClassName(ShareRN)
export const Share = ShareRN as unknown as React.ComponentType<any>