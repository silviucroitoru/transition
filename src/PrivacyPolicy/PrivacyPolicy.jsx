import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import { brand } from '../config/brand';
import './privacy-policy.css';

export default function PrivacyPolicy() {
  return (
    <div className="privacy-policy-page">
      <div className="topic-header">
        <Link to="/questionnaire">
          <img src={brand.logo.src} alt={brand.logo.alt} className="logo" />
        </Link>
      </div>
      <div className="privacy-policy-content">
        <h1 className="privacy-policy-title">
          <FormattedMessage id="privacy_title" />
        </h1>
        <p className="privacy-policy-updated">
          <FormattedMessage id="privacy_last_updated" />
        </p>

        <section>
          <h2><FormattedMessage id="privacy_intro_heading" /></h2>
          <p><FormattedMessage id="privacy_intro" /></p>
        </section>

        <section>
          <h2><FormattedMessage id="privacy_data_heading" /></h2>
          <p><FormattedMessage id="privacy_data_we_collect" /></p>
        </section>

        <section>
          <h2><FormattedMessage id="privacy_use_heading" /></h2>
          <p><FormattedMessage id="privacy_how_we_use" /></p>
        </section>

        <section>
          <h2><FormattedMessage id="privacy_storage_heading" /></h2>
          <p><FormattedMessage id="privacy_storage" /></p>
        </section>

        <section>
          <h2><FormattedMessage id="privacy_analytics_heading" /></h2>
          <p><FormattedMessage id="privacy_analytics" /></p>
        </section>

        <section>
          <h2><FormattedMessage id="privacy_rights_heading" /></h2>
          <p><FormattedMessage id="privacy_rights" /></p>
        </section>

        <section>
          <h2><FormattedMessage id="privacy_contact_heading" /></h2>
          <p><FormattedMessage id="privacy_contact" /></p>
        </section>

        <div className="privacy-policy-back">
          <Link to="/questionnaire" className="button button--secondary">
            <FormattedMessage id="privacy_back_to_questionnaire" />
          </Link>
        </div>
      </div>
    </div>
  );
}
