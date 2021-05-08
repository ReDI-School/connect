import React from 'react'

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  PDFViewer,
  Image
} from '@react-pdf/renderer'

// Create styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#E4E4E4'
  },
  header: {
    color: '#fff',
    height: '200px',
    backgroundColor: '#09375A',
    position: 'relative'
  },
  headerText1: {
    top: '50px',
    left: '270px',
    position: 'absolute',
    fontSize: '13px',
    marginBottom: '10px'
  },
  headerText2: {
    top: '70px',
    left: '270px',
    position: 'absolute',
    fontSize: '40px',
    textTransform: 'uppercase'
  },
  headerText3: {
    top: '110px',
    left: '270px',
    position: 'absolute',
    fontSize: '40px',
    textTransform: 'uppercase'
  },
  headerImg: {
    top: '50px',
    left: '50px',
    position: 'absolute',
    width: '170px',
    height: '250px'
  }
})

export interface UserCVData {
  position: string
  firstName: string
  lastName: string
  profileImage: string
}
interface CVPDFProps {
  cvData: UserCVData
}

const CVPDF = ({
  cvData: { firstName, lastName, position, profileImage }
}: CVPDFProps) => {
  return (
    <Document title={`${firstName}_${lastName}_CV.pdf`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText1}>{position}</Text>
          <Text style={styles.headerText2}>{firstName}</Text>
          <Text style={styles.headerText3}>{lastName}</Text>
          <Image style={styles.headerImg} src={profileImage} />
        </View>
      </Page>
    </Document>
  )
}

export default CVPDF
