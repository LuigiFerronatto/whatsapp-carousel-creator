<div className={styles.progressContainer}>
<div className={styles.progressBarWrapper}>
  <div className={styles.progressBar}>
    <div
      className={styles.progressFill}
      style={{ width: `${completionPercentage}%` }}
    />
  </div>

  <span className={styles.progressText}>
    {completionPercentage === 100 ?
      '✓ All fields completed!' :
      `${completionPercentage}% completed`}
  </span>
</div>
</div>

const completionPercentage = [
    isTemplateNameValid,
    isBodyTextValid,
    cards.slice(0, numCards).every(card => card.bodyText),
    cards.slice(0, numCards).every(card => card.buttons.every(button => button.text)),
  ].filter(Boolean).length * 25;