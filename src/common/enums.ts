export enum USERROLE_TYPE {
  ADMIN = 'admin',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

export enum CREATE_USERROLE_TYPE {
  TEACHER = 'teacher',
  STUDENT = 'student',
}

// ============= USED FOR IDENTIFYING BOTH POST AND SUBMISSION ========== //
export enum POST_TYPE {
  ASSIGNMENT = 'assignment',
  EXAM = 'exam',
}

// ============= USED FOR IDENTIFYING SUBMISSION STATUS ============= //
export enum SUBMISSION_STATUS_TYPE {
  PENDING = 'pending',
  SUBMITTED = 'submitted',
  EXAMINED = 'examined',
  EXPIRED = 'expired',
}

export enum CLASSROOM_TYPE {
  ONGOING = 'ongoing',
  ENDED = 'ended',
}

export enum SUBSCRIPTION_STATUS_TYPE {
  INVITED = 'invited',
  ACCEPTED = 'accepted',
}
