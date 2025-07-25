import { formatPrice, formatDuration } from "@/components/booking/utils/formatUtils";
import MultiServiceSelection from "./steps/MultiServiceSelection";
import MultiPaymentConfirmation from "./steps/MultiPaymentConfirmation";
import { useBookingForm } from "./hooks/useBookingForm";

export const BookingForm = () => {
  const {
    // Form state
    date,
    setDate,
    services,
    setServices,
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
    availableServices,
    stylists,
    currentUser,
    
    // Derived state
    selectedServices,
    selectedStylist,
    
    // Step state
    step,
    
    // Handlers
    handleSubmit,
    handlePaymentSuccess,
    handleGoBack
  } = useBookingForm();

  return (
    <div className="w-full">
      {step === 1 && (
        <MultiServiceSelection
          date={date}
          setDate={setDate}
          services={services}
          setServices={setServices}
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
          availableServices={availableServices}
          stylists={stylists}
          selectedServices={selectedServices}
          selectedStylist={selectedStylist}
          currentUser={currentUser}
          formatPrice={formatPrice}
          formatDuration={formatDuration}
        />
      )}
      
      {step === 2 && (
        <MultiPaymentConfirmation
          selectedServices={selectedServices}
          selectedStylist={selectedStylist}
          date={date}
          time={time}
          name={name}
          email={email}
          phone={phone}
          notes={notes}
          onPaymentSuccess={handlePaymentSuccess}
          onGoBack={handleGoBack}
          formatPrice={formatPrice}
          formatDuration={formatDuration}
        />
      )}
    </div>
  );
};

export default BookingForm;