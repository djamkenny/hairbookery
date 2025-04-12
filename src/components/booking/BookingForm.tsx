
import React from "react";
import { formatPrice, formatDuration } from "./utils/formatUtils";
import { useBookingForm } from "./hooks/useBookingForm";
import ServiceSelection from "./steps/ServiceSelection";
import PaymentConfirmation from "./steps/PaymentConfirmation";

export const BookingForm = () => {
  const {
    // Form state
    date,
    setDate,
    service,
    setService,
    stylist,
    setStylist,
    time,
    setTime,
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    notes,
    setNotes,
    isSubmitting,
    
    // Data state
    loading,
    services,
    stylists,
    currentUser,
    
    // Derived state
    selectedService,
    selectedStylist,
    
    // Step state
    step,
    
    // Handlers
    handleSubmit,
    handlePaymentSuccess,
    handleGoBack
  } = useBookingForm();

  return (
    <div className="space-y-6">
      {step === 1 ? (
        <ServiceSelection
          date={date}
          setDate={setDate}
          service={service}
          setService={setService}
          stylist={stylist}
          setStylist={setStylist}
          time={time}
          setTime={setTime}
          name={name}
          setName={setName}
          email={email}
          setEmail={setEmail}
          phone={phone}
          setPhone={setPhone}
          notes={notes}
          setNotes={setNotes}
          handleSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          loading={loading}
          services={services}
          stylists={stylists}
          selectedService={selectedService}
          selectedStylist={selectedStylist}
          currentUser={currentUser}
          formatPrice={formatPrice}
          formatDuration={formatDuration}
        />
      ) : (
        <PaymentConfirmation
          selectedService={selectedService}
          date={date}
          time={time}
          handlePaymentSuccess={handlePaymentSuccess}
          handleGoBack={handleGoBack}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
};

export default BookingForm;
