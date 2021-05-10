import React from "react";
import AvenirBlackFont from "../../assets/fonts/Avenir-Black.woff";
import AvenirHeavyFont from "../../assets/fonts/Avenir-Heavy.woff";
import AvenirMediumFont from "../../assets/fonts/Avenir-Medium.woff";
import AvenirMediumObliqueFont from "../../assets/fonts/Avenir-MediumOblique.woff";
import AvenirLTStdBookFont from "../../assets/fonts/AvenirLTStd-Book.woff";

import {
  Page,
  Text,
  View,
  Document,
  StyleSheet,
  Image,
  Link,
  Font,
} from "@react-pdf/renderer";

Font.register({
  family: "Avenir LT Std",
  fonts: [
    {
      src: AvenirBlackFont,
      fontWeight: 900,
      fontSize: "normal",
    },
    {
      src: AvenirHeavyFont,
      fontWeight: 800,
      fontSize: "normal",
    },
    {
      src: AvenirMediumFont,
      fontWeight: 500,
      fontSize: "normal",
    },
    {
      src: AvenirMediumObliqueFont,
      fontWeight: 500,
      fontSize: "oblique",
    },
    {
      src: AvenirLTStdBookFont,
      fontWeight: 300,
      fontSize: "normal",
    },
  ],
});

// Create styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Avenir LT Std",
    flexDirection: "column",
    border: "solid 1px yellow",
    height: "100%",
  },
  header: {
    color: "#fff",
    height: "200px",
    backgroundColor: "#09375A",
    position: "relative",
  },
  headerText1: {
    top: "50px",
    left: "237px",
    position: "absolute",
    fontSize: "14px",
    marginBottom: "25px",
    letterSpacing: "0.63px",
  },
  headerText2: {
    top: "70px",
    left: "235px",
    position: "absolute",
    fontSize: "40px",
    fontWeight: 900,
    textTransform: "uppercase",
  },
  headerText3: {
    top: "110px",
    left: "235px",
    position: "absolute",
    fontSize: "40px",
    fontWeight: 900,
    textTransform: "uppercase",
  },
  headerImg: {
    top: "45px",
    left: "34.5px",
    position: "absolute",
    width: "170px",
    height: "250px",
  },
  content: {
    flexDirection: "row",
  },
  contentLeft: {
    flexDirection: "column",
    width: "40%",
    marginTop: "115px",
  },
  contentRight: {
    flexDirection: "column",
    width: "60%",
  },
  contentViewLeft: {
    margin: "10px 29px 0 36px",
    padding: "5px 0",
    borderTop: "1px solid #707070",
  },
  contentViewRight: {
    margin: "15px 36px 0 -2px",
    padding: "5px 0",
    borderTop: "1px solid #707070",
  },
  contentHeading: {
    fontSize: "16px",
    fontWeight: 900,
    lineHeight: "1.1",
    letterSpacing: "0.63px",
    textTransform: "uppercase",
  },
  contentSubHeading: {
    fontSize: "12px",
    fontWeight: 900,
    paddingTop: "12px",
    lineHeight: "0.8",
    letterSpacing: "0.47px",
  },
  ContentList: {
    fontSize: "10px",
    paddingTop: "5px",
    lineHeight: "1px",
  },
  ContentListItem: {
    fontSize: "10px",
    paddingVertical: "5px",
    lineHeight: "0.54",
    letterSpacing: "0.41px",
  },
  contentPara: {
    fontSize: "10px",
    paddingTop: "10px",
    lineHeight: "1.31",
    letterSpacing: "0.41px",
  },
  contentLink: {
    fontSize: "10px",
    paddingVertical: "8px",
    lineHeight: "0.54",
    cursor: "pointer",
    letterSpacing: "0.41px",
  },
  socialLink: {
    fontSize: "10px",
    paddingVertical: "2px",
    lineHeight: "1",
    cursor: "pointer",
    letterSpacing: "0.41px",
  },
  projectView: {
    flexDirection: "column",
  },
  experienceView: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  experienceView1: {
    flexDirection: "row",
    alignItems: "center",
  },
  experienceView2: {
    marginLeft: "10px",
    fontSize: "12px",
    fontWeight: 300,
    paddingTop: "15px",
    lineHeight: "1.2",
    letterSpacing: "0.47px",
  },
  contactView: {
    margin: "0 36px 0 -2px",
    padding: "10px 0 0",
  },
  contactDivider: {
    width: "100%",
    flexDirection: "row",
    padding: "12px 0 0",
  },
  contactDividerLeft: {
    width: "50%",
    marginRight: "10px",
  },
  contactDividerRight: {
    width: "50%",
  },
  ContactListItem: {
    fontSize: "10px",
    paddingVertical: "2px",
    lineHeight: "1",
    letterSpacing: "0.41px",
  },
});

export interface userExperience {
  title: string;
  company: string;
  startDate: Date;
  endDate: Date;
  rolesResponsibilities: string;
  description: string;
}
export interface userEducation {
  type: string;
  institutionName: string;
  startDate: Date;
  endDate: Date;
  description: string;
}
export interface userProject {
  name: string;
  link: string;
  description: string;
}
export interface UserCVData {
  desiredPositions: string[];
  firstName: string;
  lastName: string;
  profileImage: string;
  email: string;
  phoneNumber: string;
  address: string;
  personalWebsite: string;
  workingLanguage: string[];
  yearsOfRelevantExperience: string;
  desiredEmploymentType: string;
  availability: string;
  aboutYourself: string;
  topSkills: string[];
  experience: userExperience[];
  education: userEducation[];
  projects: userProject[];
  linkedin: string;
  github: string;
}
interface CVPDFProps {
  cvData: UserCVData;
}

const CVPDF = ({
  cvData: {
    firstName,
    lastName,
    desiredPositions,
    profileImage,
    aboutYourself,
    topSkills,
    workingLanguage,
    projects,
    experience,
    education,
    phoneNumber,
    address,
    personalWebsite,
    linkedin,
    github,
  },
}: CVPDFProps) => {
  return (
    <Document title={`${firstName}_${lastName}_CV.pdf`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText1}>{desiredPositions.join(", ")}</Text>
          <Text style={styles.headerText2}>{firstName}</Text>
          <Text style={styles.headerText3}>{lastName}</Text>
          <Image style={styles.headerImg} src={profileImage} />
        </View>
        <View style={styles.content}>
          <View style={styles.contentLeft}>
            <View style={styles.contentViewLeft}>
              <Text style={styles.contentHeading}>About</Text>
              <Text style={styles.contentPara}>{aboutYourself}</Text>
            </View>
            <View style={styles.contentViewLeft}>
              <Text style={styles.contentHeading}>Skills</Text>
              <View style={styles.ContentList}>
                {topSkills.map((skill, index) => (
                  <Text key={`skill_${index}`} style={styles.ContentListItem}>
                    {skill}
                  </Text>
                ))}
              </View>
            </View>
            <View style={styles.contentViewLeft}>
              <Text style={styles.contentHeading}>Languages</Text>
              <View style={styles.ContentList}>
                {workingLanguage.map((language, index) => (
                  <Text
                    key={`language_${index}`}
                    style={styles.ContentListItem}
                  >
                    {language}
                  </Text>
                ))}
              </View>
            </View>
            <View style={styles.contentViewLeft}>
              <Text style={styles.contentHeading}>{`Projects&Awards`}</Text>
              {projects.map((project, index) => (
                <View key={`project_${index}`} style={styles.projectView}>
                  <Text style={styles.contentSubHeading}>{project.name}</Text>
                  <Link src={project.link} style={styles.contentLink}>
                    {project.link.split("//")[1]}
                  </Link>
                  <Text style={styles.contentPara}>{project.description}</Text>
                </View>
              ))}
            </View>
          </View>
          <View style={styles.contentRight}>
            <View style={styles.contactView}>
              <Text style={styles.contentHeading}>Contact</Text>
              <View style={styles.contactDivider}>
                <View style={styles.contactDividerLeft}>
                  <Text style={styles.ContactListItem}>{phoneNumber}</Text>
                  <Text style={styles.ContactListItem}>{address}</Text>
                </View>
                <View style={styles.contactDividerRight}>
                  <Link src={personalWebsite} style={styles.socialLink}>
                    {personalWebsite.split("//")[1]}
                  </Link>
                  <Link src={linkedin} style={styles.socialLink}>
                    {linkedin.split("//")[1]}
                  </Link>
                  <Link src={github} style={styles.socialLink}>
                    {github.split("//")[1]}
                  </Link>
                </View>
              </View>
            </View>
            <View style={styles.contentViewRight}>
              <Text style={styles.contentHeading}>Work Experience</Text>
              {experience.map((experience, index) => (
                <View key={`experience_${index}`} style={{ width: "100%" }}>
                  <View style={styles.experienceView}>
                    <View style={styles.experienceView1}>
                      <Text style={styles.contentSubHeading}>
                        {experience.title}
                      </Text>
                      <Text style={styles.experienceView2}>
                        {experience.company}
                      </Text>
                    </View>
                    <Text style={[styles.contentSubHeading]}>
                      {`${experience.startDate.getMonth()}/${experience.startDate.getFullYear()} - ${experience.endDate.getMonth()}/${experience.endDate.getFullYear()}`}
                    </Text>
                  </View>
                  <Text style={styles.contentPara}>
                    {experience.description}
                  </Text>
                </View>
              ))}
            </View>
            <View style={styles.contentViewRight}>
              <Text style={styles.contentHeading}>Education</Text>
              {education.map((education, index) => (
                <View key={`experience_${index}`} style={{ width: "100%" }}>
                  <View style={styles.experienceView}>
                    <View style={styles.experienceView1}>
                      <Text style={styles.contentSubHeading}>
                        {education.type}
                      </Text>
                      <Text style={styles.experienceView2}>
                        {education.institutionName}
                      </Text>
                    </View>
                    <Text style={[styles.contentSubHeading]}>
                      {`${education.startDate.getMonth()}/${education.startDate.getFullYear()} - ${education.endDate.getMonth()}/${education.endDate.getFullYear()}`}
                    </Text>
                  </View>
                  <Text style={styles.contentPara}>
                    {education.description}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};

export default CVPDF;
