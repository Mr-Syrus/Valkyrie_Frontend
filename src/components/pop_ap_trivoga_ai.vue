<template>
  <div class="alert-container">
    <div class="alert-header">
      <span class="car-number">Машина с номером BNK 568</span>
      <div class="event-badge">
        <img src="@/assets/fire-icon.svg" alt="Пожар" class="event-icon" />
        <span class="event-text">ПОЖАР</span>
      </div>
    </div>

    <div class="location-section">
      <span class="location-label">местоположение</span>
      <span class="object-code">объект FHDU1823</span>
    </div>

    <div class="alert-footer">
      <button class="reply-btn">Ответить</button>
      <div class="redirect-timer">
        Будет перенаправлено выше через 19:46
      </div>
    </div>
  </div>
</template>

<style scoped>
.alert-container {
  border: 2px solid #e53935;
  border-radius: 8px;
  padding: 16px;
  font-family: 'Arial', sans-serif;
  max-width: 400px;
  background-color: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.alert-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid #eee;
}

.car-number {
  font-weight: bold;
  font-size: 16px;
  color: #333;
}

.event-badge {
  display: flex;
  align-items: center;
  background-color: #ffebee;
  padding: 4px 8px;
  border-radius: 4px;
}

.event-icon {
  width: 20px;
  height: 20px;
  margin-right: 6px;
}

.event-text {
  color: #e53935;
  font-weight: bold;
  font-size: 14px;
}

.location-section {
  margin-bottom: 16px;
  padding: 8px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.location-label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 4px;
}

.object-code {
  font-weight: bold;
  color: #333;
  font-size: 16px;
}

.alert-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.reply-btn {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: bold;
  cursor: pointer;
  font-size: 14px;
}

.reply-btn:hover {
  background-color: #388e3c;
}

.redirect-timer {
  color: #666;
  font-size: 14px;
  font-weight: bold;
}
</style>