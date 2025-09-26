import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  SafeAreaView,
} from 'react-native';
import BackButton from '../Component/BackButton';

const TermsConditionScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {/* Header */}
      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Terms and Conditions</Text>
          <Text style={styles.paragraph}>
            Welcome to Learning Saint and One Rupee Classroom ("the App"). These Terms and Conditions ("Terms") govern your access to and use of our mobile application, website, and related services (collectively referred to as "Services"). By downloading, installing, registering, or using our Services, you agree to comply with these Terms. If you do not agree, please do not use our Services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. About Us</Text>
          <Text style={styles.paragraph}>
            Learning Saint Pvt. Ltd. ("Company," "we," "our," or "us") operates the Learning Saint App and its initiative, One Rupee Classroom, to provide affordable, accessible, and high-quality education.
          </Text>
          <Text style={styles.paragraph}>
            The Services include professional courses, training, and other educational resources.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. Eligibility</Text>
          <Text style={styles.paragraph}>
            You must be at least 13 years of age to use our Services.
          </Text>
          <Text style={styles.paragraph}>
            If you are under 18, you may use the Services only with the consent and supervision of a parent or legal guardian.
          </Text>
          <Text style={styles.paragraph}>
            By using our Services, you confirm that the information you provide is true, accurate, and complete.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Account Registration</Text>
          <Text style={styles.paragraph}>
            To access certain features, you may be required to create an account.
          </Text>
          <Text style={styles.paragraph}>
            You are responsible for maintaining the confidentiality of your login credentials.
          </Text>
          <Text style={styles.paragraph}>
            You agree to notify us immediately of any unauthorised access to your account.
          </Text>
          <Text style={styles.paragraph}>
            We are not liable for losses caused by unauthorised use of your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>4. Services Offered</Text>
          <Text style={styles.paragraph}>
            Learning Saint Courses: Professional training in Data Science, Cybersecurity, Digital Marketing, Full Stack Development, and more.
          </Text>
          <Text style={styles.paragraph}>
            One Rupee Classroom: Affordable courses starting at ₹1, designed to make education accessible to all.
          </Text>
          <Text style={styles.paragraph}>
            We may modify, suspend, or discontinue any part of the Services at our sole discretion.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>5. Fees and Payments</Text>
          <Text style={styles.paragraph}>
            Some Services are free, while others may require payment.
          </Text>
          <Text style={styles.paragraph}>
            Fees are clearly displayed before purchase.
          </Text>
          <Text style={styles.paragraph}>
            Payments are non-refundable unless specifically stated.
          </Text>
          <Text style={styles.paragraph}>
            Pay-after-placement or other financing options, where applicable, are governed by separate agreements.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>6. User Responsibilities</Text>
          <Text style={styles.paragraph}>
            You agree not to:
          </Text>
          <Text style={styles.paragraph}>
            • Use the Services for unlawful purposes.
          </Text>
          <Text style={styles.paragraph}>
            • Share or distribute course material without permission.
          </Text>
          <Text style={styles.paragraph}>
            • Upload harmful code, viruses, or disruptive content.
          </Text>
          <Text style={styles.paragraph}>
            • Misuse promotional offers, discounts, or referral programmes.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>7. Intellectual Property</Text>
          <Text style={styles.paragraph}>
            All content, including text, graphics, videos, logos, and software, is owned by Learning Saint Pvt. Ltd. or its licensors.
          </Text>
          <Text style={styles.paragraph}>
            You may access the content only for personal, non-commercial use.
          </Text>
          <Text style={styles.paragraph}>
            Reproduction, distribution, or modification without prior consent is prohibited.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>8. Limitation of Liability</Text>
          <Text style={styles.paragraph}>
            We strive to provide accurate and updated educational content but do not guarantee outcomes such as employment or placement unless specifically mentioned in a separate written agreement.
          </Text>
          <Text style={styles.paragraph}>
            We are not liable for:
          </Text>
          <Text style={styles.paragraph}>
            • Interruptions in service
          </Text>
          <Text style={styles.paragraph}>
            • Loss of data
          </Text>
          <Text style={styles.paragraph}>
            • Third-party service failures
          </Text>
          <Text style={styles.paragraph}>
            • User's inability to achieve expected learning outcomes
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>9. Privacy</Text>
          <Text style={styles.paragraph}>
            Your use of the App is also governed by our Privacy Policy.
          </Text>
          <Text style={styles.paragraph}>
            We collect, use, and store personal information in compliance with applicable laws.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>10. Termination</Text>
          <Text style={styles.paragraph}>
            We may suspend or terminate your account if you violate these Terms.
          </Text>
          <Text style={styles.paragraph}>
            You may terminate your account at any time by contacting our support team.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>11. Third-Party Links</Text>
          <Text style={styles.paragraph}>
            The App may contain links to third-party websites or services.
          </Text>
          <Text style={styles.paragraph}>
            We are not responsible for their content, privacy policies, or practices.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>12. Governing Law</Text>
          <Text style={styles.paragraph}>
            These Terms are governed by the laws of India.
          </Text>
          <Text style={styles.paragraph}>
            Any disputes shall be subject to the exclusive jurisdiction of the courts in Noida, Uttar Pradesh, India.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>13. Changes to Terms</Text>
          <Text style={styles.paragraph}>
            We may update these Terms from time to time.
          </Text>
          <Text style={styles.paragraph}>
            Continued use of the Services after changes implies acceptance of the updated Terms.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>14. Contact Us</Text>
          <Text style={styles.paragraph}>
            For questions or concerns regarding these Terms, please contact:
          </Text>
          <Text style={styles.paragraph}>
            Learning Saint Pvt. Ltd.
          </Text>
          <Text style={styles.paragraph}>
            H-70, Second Floor, Sector-63,
          </Text>
          <Text style={styles.paragraph}>
            Noida, Uttar Pradesh – 201301, India
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default TermsConditionScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    marginTop: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },

  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  placeholder: {
    width: 50,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginBottom: 20,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    color: '#666',
    marginBottom: 15,
  },
}); 