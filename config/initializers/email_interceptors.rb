ActionMailer::Base.register_interceptor(DevelopmentMailInterceptor) if Rails.env.test? || Rails.env.staging?
