// User service cho CodeLand.io platform
import { apiClient, ApiError } from './api';
import type {
  User,
  UserRegistration,
  AdminUserCreate,
  UsersResponse,
  UserResponse,
  SuccessResponse,
  PingResponse,
  ProfileImageUploadResponse,
  ProfileImageResponse,
} from '../types/api';

export class UserService {
  // Ping users service để kiểm tra health
  async ping(): Promise<PingResponse> {
    try {
      return await apiClient.get<PingResponse>('/users/ping');
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Không thể kết nối đến dịch vụ người dùng');
    }
  }

  // Lấy tất cả người dùng
  async getAll(): Promise<User[]> {
    try {
      const response = await apiClient.get<UsersResponse>('/users/');
      return response.data.users;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Không thể tải danh sách người dùng');
    }
  }

  // Lấy người dùng theo ID
  async getById(userId: number): Promise<User> {
    try {
      const response = await apiClient.get<UserResponse>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new ApiError(404, 'Không tìm thấy người dùng');
        }
        throw error;
      }
      throw new ApiError(500, 'Không thể tải thông tin người dùng');
    }
  }

  // Tạo người dùng mới (admin only)
  async create(userData: UserRegistration): Promise<SuccessResponse> {
    try {
      // Validate dữ liệu trước khi gửi
      const validation = this.validateUserData(userData);
      if (!validation.isValid) {
        throw new ApiError(400, validation.errors.join(', '));
      }

      return await apiClient.post<SuccessResponse>('/users/', userData, true);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new ApiError(401, 'Bạn cần đăng nhập để tạo người dùng');
        }
        if (error.status === 403) {
          throw new ApiError(403, 'Chỉ admin mới có thể tạo người dùng');
        }
        throw error;
      }
      throw new ApiError(500, 'Không thể tạo người dùng mới');
    }
  }

  // Tạo người dùng với quyền admin (admin only) - endpoint mới
  async adminCreate(userData: AdminUserCreate): Promise<{ status: string; message: string; data: User }> {
    try {
      // Validate dữ liệu cơ bản trước khi gửi
      const validation = this.validateUserData({
        username: userData.username,
        email: userData.email,
        password: userData.password,
      });
      if (!validation.isValid) {
        throw new ApiError(400, validation.errors.join(', '));
      }

      // Prepare data với defaults
      const requestData: AdminUserCreate = {
        username: userData.username.trim(),
        email: userData.email.trim(),
        password: userData.password,
        admin: userData.admin ?? false,
        active: userData.active ?? true,
      };

      return await apiClient.post<{ status: string; message: string; data: User }>('/users/admin_create', requestData, true);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 401) {
          throw new ApiError(401, 'Bạn cần đăng nhập để tạo người dùng');
        }
        if (error.status === 403) {
          throw new ApiError(403, 'Chỉ admin mới có thể tạo người dùng với quyền admin');
        }
        throw error;
      }
      throw new ApiError(500, 'Không thể tạo người dùng mới');
    }
  }

  // Tìm kiếm người dùng theo username hoặc email
  async search(query: string): Promise<User[]> {
    try {
      const users = await this.getAll();
      const lowerQuery = query.toLowerCase();
      
      return users.filter(user => 
        user.username.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Không thể tìm kiếm người dùng');
    }
  }

  // Lấy danh sách admin users
  async getAdmins(): Promise<User[]> {
    try {
      const users = await this.getAll();
      return users.filter(user => user.admin === true);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Không thể tải danh sách admin');
    }
  }

  // Lấy danh sách active users
  async getActiveUsers(): Promise<User[]> {
    try {
      const users = await this.getAll();
      return users.filter(user => user.active === true);
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(500, 'Không thể tải danh sách người dùng hoạt động');
    }
  }

  // Kiểm tra xem email đã tồn tại chưa
  async isEmailExists(email: string): Promise<boolean> {
    try {
      const users = await this.getAll();
      return users.some(user => user.email.toLowerCase() === email.toLowerCase());
    } catch {
      // Nếu không thể kiểm tra, return false để không block user
      return false;
    }
  }

  // Kiểm tra xem username đã tồn tại chưa
  async isUsernameExists(username: string): Promise<boolean> {
    try {
      const users = await this.getAll();
      return users.some(user => user.username.toLowerCase() === username.toLowerCase());
    } catch {
      // Nếu không thể kiểm tra, return false để không block user
      return false;
    }
  }

  // Validate user data trước khi gửi
  validateUserData(data: UserRegistration): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate username
    if (!data.username || data.username.trim().length === 0) {
      errors.push('Tên người dùng không được để trống');
    } else if (data.username.length < 3) {
      errors.push('Tên người dùng phải có ít nhất 3 ký tự');
    } else if (data.username.length > 128) {
      errors.push('Tên người dùng không được vượt quá 128 ký tự');
    } else if (!/^[a-zA-Z0-9_]+$/.test(data.username)) {
      errors.push('Tên người dùng chỉ được chứa chữ cái, số và dấu gạch dưới');
    }

    // Validate email
    if (!data.email || data.email.trim().length === 0) {
      errors.push('Email không được để trống');
    } else if (data.email.length > 128) {
      errors.push('Email không được vượt quá 128 ký tự');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
      errors.push('Email không đúng định dạng');
    }

    // Validate password
    if (!data.password || data.password.length === 0) {
      errors.push('Mật khẩu không được để trống');
    } else if (data.password.length < 6) {
      errors.push('Mật khẩu phải có ít nhất 6 ký tự');
    } else if (data.password.length > 128) {
      errors.push('Mật khẩu không được vượt quá 128 ký tự');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Validate email format
  isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  // Validate username format
  isValidUsername(username: string): boolean {
    return /^[a-zA-Z0-9_]{3,128}$/.test(username);
  }

  // Check password strength
  checkPasswordStrength(password: string): {
    score: number; // 0-4
    feedback: string[];
  } {
    const feedback: string[] = [];
    let score = 0;

    if (password.length >= 8) {
      score++;
    } else {
      feedback.push('Mật khẩu nên có ít nhất 8 ký tự');
    }

    if (/[a-z]/.test(password)) {
      score++;
    } else {
      feedback.push('Mật khẩu nên có ít nhất 1 chữ thường');
    }

    if (/[A-Z]/.test(password)) {
      score++;
    } else {
      feedback.push('Mật khẩu nên có ít nhất 1 chữ hoa');
    }

    if (/[0-9]/.test(password)) {
      score++;
    } else {
      feedback.push('Mật khẩu nên có ít nhất 1 số');
    }

    if (/[^a-zA-Z0-9]/.test(password)) {
      score++;
    } else {
      feedback.push('Mật khẩu nên có ít nhất 1 ký tự đặc biệt');
    }

    return { score, feedback };
  }

  // Upload profile image cho user
  async uploadProfileImage(userId: number, imageFile: File): Promise<ProfileImageUploadResponse> {
    try {
      // Validate file trước khi upload
      const validation = this.validateImageFile(imageFile);
      if (!validation.isValid) {
        throw new ApiError(400, validation.errors.join(', '));
      }

      // Tạo FormData để gửi file
      const formData = new FormData();
      formData.append('profile_image', imageFile);

      return await apiClient.postFile<ProfileImageUploadResponse>(`/users/${userId}/profile-image`, formData, true);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 403) {
          throw new ApiError(403, 'Bạn không có quyền upload ảnh cho người dùng này');
        }
        if (error.status === 404) {
          throw new ApiError(404, 'Không tìm thấy người dùng');
        }
        throw error;
      }
      throw new ApiError(500, 'Không thể upload ảnh đại diện');
    }
  }

  // Lấy URL ảnh đại diện của user
  async getProfileImageUrl(userId: number): Promise<ProfileImageResponse> {
    try {
      return await apiClient.get<ProfileImageResponse>(`/users/${userId}/profile-image`, true);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new ApiError(404, 'Người dùng chưa có ảnh đại diện');
        }
        if (error.status === 403) {
          throw new ApiError(403, 'Bạn không có quyền xem ảnh của người dùng này');
        }
        throw error;
      }
      throw new ApiError(500, 'Không thể lấy ảnh đại diện');
    }
  }

  // Xóa ảnh đại diện của user
  async deleteProfileImage(userId: number): Promise<SuccessResponse> {
    try {
      return await apiClient.delete<SuccessResponse>(`/users/${userId}/profile-image`, true);
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.status === 404) {
          throw new ApiError(404, 'Không tìm thấy người dùng');
        }
        if (error.status === 403) {
          throw new ApiError(403, 'Bạn không có quyền xóa ảnh của người dùng này');
        }
        throw error;
      }
      throw new ApiError(500, 'Không thể xóa ảnh đại diện');
    }
  }

  // Validate image file trước khi upload
  validateImageFile(file: File): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    const maxSizeInBytes = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif'];

    // Kiểm tra file type
    if (!allowedTypes.includes(file.type)) {
      errors.push('Chỉ chấp nhận file ảnh định dạng PNG, JPG, JPEG hoặc GIF');
    }

    // Kiểm tra file size
    if (file.size > maxSizeInBytes) {
      errors.push('Kích thước file không được vượt quá 5MB');
    }

    // Kiểm tra file có tồn tại
    if (!file || file.size === 0) {
      errors.push('Vui lòng chọn file ảnh hợp lệ');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const userService = new UserService();