import React, { useState, useImperativeHandle, forwardRef } from 'react';
import CustomAlert from './CustomAlert';

const CustomAlertManager = forwardRef((props, ref) => {
  const [alertConfig, setAlertConfig] = useState(null);
  const [visible, setVisible] = useState(false);

  useImperativeHandle(ref, () => ({
    show: (config) => {
      console.log('🔔 CustomAlertManager: Showing alert with config:', config);
      setAlertConfig(config);
      setVisible(true);
    },
    hide: () => {
      console.log('🔔 CustomAlertManager: Hiding alert');
      setVisible(false);
      setTimeout(() => {
        setAlertConfig(null);
      }, 300); // Wait for animation to complete
    },
  }));

  const handleClose = () => {
    setVisible(false);
    setTimeout(() => {
      setAlertConfig(null);
    }, 300);
  };

  const handleConfirm = () => {
    if (alertConfig?.onConfirm) {
      alertConfig.onConfirm();
    }
    handleClose();
  };

  const handleCancel = () => {
    if (alertConfig?.onCancel) {
      alertConfig.onCancel();
    }
    handleClose();
  };

  if (!alertConfig) return null;

  return (
    <CustomAlert
      visible={visible}
      title={alertConfig.title}
      message={alertConfig.message}
      type={alertConfig.type}
      showCancel={alertConfig.showCancel}
      confirmText={alertConfig.confirmText}
      cancelText={alertConfig.cancelText}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
      onClose={handleClose}
      autoClose={alertConfig.autoClose}
      autoCloseDelay={alertConfig.autoCloseDelay}
      showIcon={alertConfig.showIcon}
      customIcon={alertConfig.customIcon}
    />
  );
});

CustomAlertManager.displayName = 'CustomAlertManager';

export default CustomAlertManager;
